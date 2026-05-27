from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Quiz, Question, Result


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False, default='student')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'role']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        role = validated_data.pop('role', 'student')
        user = User.objects.create_user(**validated_data)
        # Store role in profile (we use is_staff for instructor)
        if role == 'instructor':
            user.is_staff = True
            user.save()
        return user


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'order', 'quiz']
        read_only_fields = ['quiz']


class QuestionStudentSerializer(serializers.ModelSerializer):
    """Hides correct answer from students"""
    class Meta:
        model = Question
        fields = ['id', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'order']


class QuizSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    question_count = serializers.SerializerMethodField()
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'category', 'time_limit', 'pass_score',
                  'is_published', 'created_by', 'created_by_name', 'question_count', 'questions', 'created_at']
        read_only_fields = ['created_by', 'created_at']

    def get_created_by_name(self, obj):
        return f'{obj.created_by.first_name} {obj.created_by.last_name}'.strip() or obj.created_by.username

    def get_question_count(self, obj):
        return obj.questions.count()


class QuizStudentSerializer(serializers.ModelSerializer):
    """For students — hides answers"""
    questions = QuestionStudentSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'category', 'time_limit', 'pass_score',
                  'question_count', 'questions', 'created_by_name', 'created_at']

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_created_by_name(self, obj):
        return f'{obj.created_by.first_name} {obj.created_by.last_name}'.strip() or obj.created_by.username


class ResultSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = ['id', 'quiz', 'quiz_title', 'student', 'student_name', 'score',
                  'total_questions', 'percentage', 'passed', 'time_taken', 'completed_at']
        read_only_fields = ['student', 'completed_at']

    def get_student_name(self, obj):
        return f'{obj.student.first_name} {obj.student.last_name}'.strip() or obj.student.username
