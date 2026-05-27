import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quizmaster.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Quiz, Question

# ─── Create instructor ────────────────────────────────────────────────────────
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
    print('✅ Instructor created — username: instructor / password: password123')
else:
    print('ℹ️  Instructor already exists')

# ─── Delete old quizzes ───────────────────────────────────────────────────────
Quiz.objects.filter(created_by=instructor).delete()
print('🗑️  Old quizzes removed')

# ─── QUIZ 1: Cell Biology ─────────────────────────────────────────────────────
quiz1 = Quiz.objects.create(
    title='Cell Biology Basics',
    description='Test your knowledge of cell structure, function and organelles.',
    category='Biology',
    time_limit=10,
    pass_score=70,
    created_by=instructor,
    is_published=True,
)

q1_questions = [
    ('What is the powerhouse of the cell?', 'Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus', 'B'),
    ('Which organelle is responsible for protein synthesis?', 'Lysosome', 'Vacuole', 'Ribosome', 'Centrosome', 'C'),
    ('What is the function of the cell membrane?', 'Energy production', 'Protein storage', 'Controls what enters and exits the cell', 'DNA replication', 'C'),
    ('Which type of cell lacks a nucleus?', 'Animal cell', 'Plant cell', 'Fungal cell', 'Prokaryotic cell', 'D'),
    ('What is the gel-like substance inside a cell called?', 'Plasma', 'Cytoplasm', 'Nucleoplasm', 'Serum', 'B'),
    ('Which organelle contains the genetic material of a cell?', 'Mitochondria', 'Ribosome', 'Nucleus', 'Vacuole', 'C'),
    ('What process do plant cells use to make food?', 'Respiration', 'Fermentation', 'Photosynthesis', 'Digestion', 'C'),
    ('What is the function of lysosomes?', 'Protein synthesis', 'Energy production', 'Digestion of waste materials', 'Cell division', 'C'),
    ('Which organelle is found in plant cells but NOT animal cells?', 'Mitochondria', 'Nucleus', 'Chloroplast', 'Ribosome', 'C'),
    ('What is the basic unit of life?', 'Tissue', 'Organ', 'Cell', 'Molecule', 'C'),
]

for i, (text, a, b, c, d, ans) in enumerate(q1_questions):
    Question.objects.create(quiz=quiz1, text=text, option_a=a, option_b=b, option_c=c, option_d=d, correct_answer=ans, order=i+1)

print(f'✅ Quiz 1: {quiz1.title} ({len(q1_questions)} questions)')

# ─── QUIZ 2: Human Body Systems ───────────────────────────────────────────────
quiz2 = Quiz.objects.create(
    title='Human Body Systems',
    description='Test your understanding of the major systems in the human body.',
    category='Biology',
    time_limit=12,
    pass_score=65,
    created_by=instructor,
    is_published=True,
)

q2_questions = [
    ('Which organ pumps blood throughout the body?', 'Lungs', 'Liver', 'Heart', 'Kidneys', 'C'),
    ('What is the primary function of red blood cells?', 'Fight infection', 'Carry oxygen', 'Clot blood', 'Produce hormones', 'B'),
    ('Which system controls body functions using hormones?', 'Nervous system', 'Digestive system', 'Endocrine system', 'Skeletal system', 'C'),
    ('Where does digestion begin?', 'Stomach', 'Small intestine', 'Liver', 'Mouth', 'D'),
    ('What is the largest organ in the human body?', 'Heart', 'Liver', 'Brain', 'Skin', 'D'),
    ('Which organ filters waste from the blood?', 'Liver', 'Kidney', 'Spleen', 'Pancreas', 'B'),
    ('How many chambers does the human heart have?', 'Two', 'Three', 'Four', 'Five', 'C'),
    ('What is the main function of the respiratory system?', 'Digesting food', 'Pumping blood', 'Gas exchange', 'Hormone production', 'C'),
    ('Which bone protects the brain?', 'Spine', 'Ribcage', 'Skull', 'Femur', 'C'),
    ('What carries electrical signals in the nervous system?', 'Red blood cells', 'Neurons', 'Platelets', 'Hormones', 'B'),
    ('Which organ produces insulin?', 'Liver', 'Kidney', 'Pancreas', 'Spleen', 'C'),
    ('What is the longest bone in the human body?', 'Humerus', 'Tibia', 'Femur', 'Fibula', 'C'),
]

for i, (text, a, b, c, d, ans) in enumerate(q2_questions):
    Question.objects.create(quiz=quiz2, text=text, option_a=a, option_b=b, option_c=c, option_d=d, correct_answer=ans, order=i+1)

print(f'✅ Quiz 2: {quiz2.title} ({len(q2_questions)} questions)')

# ─── QUIZ 3: Genetics & Evolution ─────────────────────────────────────────────
quiz3 = Quiz.objects.create(
    title='Genetics & Evolution',
    description='Explore the principles of heredity, DNA and evolutionary biology.',
    category='Biology',
    time_limit=15,
    pass_score=60,
    created_by=instructor,
    is_published=True,
)

q3_questions = [
    ('What is DNA?', 'A protein', 'A type of fat', 'A molecule carrying genetic information', 'A hormone', 'C'),
    ('Who is known as the father of genetics?', 'Charles Darwin', 'Gregor Mendel', 'Louis Pasteur', 'Isaac Newton', 'B'),
    ('What are the building blocks of DNA called?', 'Amino acids', 'Fatty acids', 'Nucleotides', 'Enzymes', 'C'),
    ('What is a gene?', 'A type of cell', 'A segment of DNA that codes for a trait', 'A chromosome', 'A type of protein', 'B'),
    ('How many chromosomes do humans have?', '23', '44', '46', '48', 'C'),
    ('What is the process of copying DNA called?', 'Transcription', 'Translation', 'Replication', 'Mutation', 'C'),
    ('Which scientist proposed the theory of natural selection?', 'Gregor Mendel', 'Louis Pasteur', 'Charles Darwin', 'Albert Einstein', 'C'),
    ('What is a mutation?', 'Normal cell division', 'A change in the DNA sequence', 'A type of protein', 'Cell death', 'B'),
    ('What does RNA stand for?', 'Ribonucleic Acid', 'Replicating Nuclear Acid', 'Random Nucleotide Acid', 'Ribose Nucleic Array', 'A'),
    ('What is natural selection?', 'Random changes in genes', 'Survival of organisms best adapted to their environment', 'Artificial breeding', 'Gene mutation', 'B'),
]

for i, (text, a, b, c, d, ans) in enumerate(q3_questions):
    Question.objects.create(quiz=quiz3, text=text, option_a=a, option_b=b, option_c=c, option_d=d, correct_answer=ans, order=i+1)

print(f'✅ Quiz 3: {quiz3.title} ({len(q3_questions)} questions)')

# ─── QUIZ 4: Ecology & Environment ────────────────────────────────────────────
quiz4 = Quiz.objects.create(
    title='Ecology & Environment',
    description='Test your knowledge of ecosystems, food chains and environmental biology.',
    category='Biology',
    time_limit=10,
    pass_score=65,
    created_by=instructor,
    is_published=True,
)

q4_questions = [
    ('What is an ecosystem?', 'A single organism', 'A community of organisms and their environment', 'A type of biome', 'A food chain', 'B'),
    ('What do producers make their food from?', 'Other animals', 'Sunlight and water', 'Dead organisms', 'Soil nutrients only', 'B'),
    ('What is a food chain?', 'A web of organisms', 'The sequence of who eats whom', 'A type of ecosystem', 'A classification system', 'B'),
    ('What are decomposers?', 'Animals that eat plants', 'Organisms that break down dead matter', 'Top predators', 'Photosynthetic organisms', 'B'),
    ('What is biodiversity?', 'Number of ecosystems', 'Variety of life in an area', 'Amount of rainfall', 'Size of a habitat', 'B'),
    ('Which gas do plants absorb during photosynthesis?', 'Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen', 'C'),
    ('What is a habitat?', 'A food source', 'The natural home of an organism', 'A type of predator', 'A water body', 'B'),
    ('What is the term for animals that eat only plants?', 'Carnivores', 'Omnivores', 'Herbivores', 'Decomposers', 'C'),
]

for i, (text, a, b, c, d, ans) in enumerate(q4_questions):
    Question.objects.create(quiz=quiz4, text=text, option_a=a, option_b=b, option_c=c, option_d=d, correct_answer=ans, order=i+1)

print(f'✅ Quiz 4: {quiz4.title} ({len(q4_questions)} questions)')

print('\n🎉 Biology database seeded successfully!')
print('   4 quizzes · 40 questions · all published')
print('   Instructor: username=instructor / password=password123')
