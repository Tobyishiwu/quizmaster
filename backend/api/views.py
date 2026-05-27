from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Quiz, Question, Result
from .serializers import (
    UserSerializer, RegisterSerializer, QuizSerializer,
    QuizStudentSerializer, QuestionSerializer, ResultSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': 'instructor' if user.is_staff else 'student',
        }, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        data = UserSerializer(user).data
        data['role'] = 'instructor' if user.is_staff else 'student'
        return Response(data)


class QuizViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Quiz.objects.filter(created_by=user).prefetch_related('questions')
        return Quiz.objects.filter(is_published=True).prefetch_related('questions')

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return QuizSerializer
        return QuizStudentSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        """Student submits quiz answers"""
        quiz = self.get_object()
        answers = request.data.get('answers', {})
        time_taken = request.data.get('time_taken', 0)
        questions = quiz.questions.all()
        score = 0
        total = questions.count()

        for q in questions:
            if answers.get(str(q.id)) == q.correct_answer:
                score += 1

        percentage = round((score / total) * 100, 1) if total > 0 else 0
        passed = percentage >= quiz.pass_score

        result = Result.objects.create(
            quiz=quiz, student=request.user, score=score,
            total_questions=total, percentage=percentage,
            passed=passed, time_taken=time_taken
        )

        return Response(ResultSerializer(result).data, status=status.HTTP_201_CREATED)


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Question.objects.filter(quiz__created_by=self.request.user)

    def perform_create(self, serializer):
        quiz_id = self.request.data.get('quiz')
        quiz = Quiz.objects.get(id=quiz_id, created_by=self.request.user)
        serializer.save(quiz=quiz)


class ResultViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Result.objects.filter(quiz__created_by=user).select_related('student', 'quiz')
        return Result.objects.filter(student=user).select_related('quiz')

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Top 10 scores for a quiz"""
        quiz_id = request.query_params.get('quiz_id')
        if not quiz_id:
            return Response({'error': 'quiz_id required'}, status=400)
        results = Result.objects.filter(quiz_id=quiz_id).order_by('-percentage', 'time_taken')[:10]
        return Response(ResultSerializer(results, many=True).data)
