import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quizmaster.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Quiz, Question

# ─── Create instructor if not exists ─────────────────────────────────────────
instructor, created = User.objects.get_or_create(
    username='instructor',
    defaults={
        'email': 'instructor@quizmaster.com',
        'first_name': 'Tobias',
        'last_name': 'Ishiwu',
        'is_staff': True,
    }
)
if created:
    instructor.set_password('password123')
    instructor.save()
    print('✅ Instructor account created — username: instructor / password: password123')
else:
    print('ℹ️  Instructor already exists')

# ─── QUIZ 1: Web Development ──────────────────────────────────────────────────
quiz1, _ = Quiz.objects.get_or_create(
    title='Introduction to Web Development',
    defaults={
        'description': 'Test your knowledge of HTML, CSS and JavaScript basics.',
        'category': 'Technology',
        'time_limit': 10,
        'pass_score': 70,
        'created_by': instructor,
        'is_published': True,
    }
)

q1_questions = [
    ('What does HTML stand for?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Logic', 'Home Tool Markup Language', 'A'),
    ('Which tag is used for the largest heading in HTML?', '<h6>', '<heading>', '<h1>', '<head>', 'C'),
    ('What does CSS stand for?', 'Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets', 'B'),
    ('Which CSS property changes the text color?', 'font-color', 'text-color', 'color', 'foreground-color', 'C'),
    ('Which language runs in the browser?', 'Python', 'Java', 'JavaScript', 'PHP', 'C'),
    ('What does DOM stand for?', 'Document Object Model', 'Data Object Management', 'Document Oriented Module', 'Digital Object Model', 'A'),
    ('Which HTML attribute is used to define inline styles?', 'class', 'font', 'styles', 'style', 'D'),
    ('What is the correct way to declare a variable in JavaScript?', 'variable x = 5', 'var x = 5', 'v x = 5', 'x := 5', 'B'),
    ('Which HTML tag creates a hyperlink?', '<link>', '<a>', '<href>', '<url>', 'B'),
    ('What does API stand for?', 'Application Programming Interface', 'Applied Program Integration', 'Automated Process Interface', 'Application Process Integration', 'A'),
]

for i, (text, a, b, c, d, ans) in enumerate(q1_questions):
    Question.objects.get_or_create(quiz=quiz1, order=i+1, defaults={'text': text, 'option_a': a, 'option_b': b, 'option_c': c, 'option_d': d, 'correct_answer': ans})

print(f'✅ Quiz 1 seeded: {quiz1.title} ({len(q1_questions)} questions)')

# ─── QUIZ 2: Python Basics ────────────────────────────────────────────────────
quiz2, _ = Quiz.objects.get_or_create(
    title='Python Programming Basics',
    defaults={
        'description': 'Test your understanding of Python fundamentals.',
        'category': 'Programming',
        'time_limit': 8,
        'pass_score': 60,
        'created_by': instructor,
        'is_published': True,
    }
)

q2_questions = [
    ('What is the correct way to print in Python?', 'echo("Hello")', 'print("Hello")', 'console.log("Hello")', 'printf("Hello")', 'B'),
    ('Which of these is a valid Python list?', '{1, 2, 3}', '(1, 2, 3)', '[1, 2, 3]', '<1, 2, 3>', 'C'),
    ('What symbol is used for comments in Python?', '//', '/*', '#', '--', 'C'),
    ('How do you define a function in Python?', 'function myFunc():', 'def myFunc():', 'func myFunc():', 'define myFunc():', 'B'),
    ('What does len() do in Python?', 'Returns the length of an object', 'Converts to lowercase', 'Returns the last element', 'Counts only numbers', 'A'),
    ('Which keyword is used to create a class in Python?', 'Class', 'object', 'class', 'define', 'C'),
    ('What is the output of 2 ** 3 in Python?', '6', '5', '8', '9', 'C'),
    ('How do you import a module in Python?', 'include module', 'require module', 'import module', 'use module', 'C'),
]

for i, (text, a, b, c, d, ans) in enumerate(q2_questions):
    Question.objects.get_or_create(quiz=quiz2, order=i+1, defaults={'text': text, 'option_a': a, 'option_b': b, 'option_c': c, 'option_d': d, 'correct_answer': ans})

print(f'✅ Quiz 2 seeded: {quiz2.title} ({len(q2_questions)} questions)')

# ─── QUIZ 3: React & Frontend ─────────────────────────────────────────────────
quiz3, _ = Quiz.objects.get_or_create(
    title='React.js Fundamentals',
    defaults={
        'description': 'Test your knowledge of React concepts and best practices.',
        'category': 'Frontend',
        'time_limit': 12,
        'pass_score': 65,
        'created_by': instructor,
        'is_published': True,
    }
)

q3_questions = [
    ('What is React?', 'A backend framework', 'A database', 'A JavaScript library for building UIs', 'A CSS framework', 'C'),
    ('What is JSX?', 'A JavaScript extension for XML-like syntax', 'A new programming language', 'A CSS preprocessor', 'A backend template engine', 'A'),
    ('Which hook is used for state management in React?', 'useEffect', 'useState', 'useContext', 'useReducer', 'B'),
    ('What is a React component?', 'A CSS class', 'A reusable piece of UI', 'A database table', 'A server function', 'B'),
    ('What does useEffect do?', 'Manages state', 'Handles side effects', 'Creates context', 'Defines routes', 'B'),
    ('How do you pass data to a child component?', 'Using state', 'Using props', 'Using context only', 'Using localStorage', 'B'),
    ('What is the virtual DOM?', 'A real browser DOM', 'A lightweight copy of the real DOM', 'A database', 'A CSS engine', 'B'),
    ('Which method renders a React component to the DOM?', 'ReactDOM.render()', 'React.mount()', 'React.display()', 'ReactDOM.start()', 'A'),
]

for i, (text, a, b, c, d, ans) in enumerate(q3_questions):
    Question.objects.get_or_create(quiz=quiz3, order=i+1, defaults={'text': text, 'option_a': a, 'option_b': b, 'option_c': c, 'option_d': d, 'correct_answer': ans})

print(f'✅ Quiz 3 seeded: {quiz3.title} ({len(q3_questions)} questions)')

print('\n🎉 Database seeded successfully!')
print('   3 quizzes · 26 questions · all published')
print('   Instructor login: username=instructor / password=password123')