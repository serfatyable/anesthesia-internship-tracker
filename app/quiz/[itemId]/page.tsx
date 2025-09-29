'use client';

import { useState, useEffect } from 'react';
import BackButton from '@/components/ui/BackButton';

interface QuizPageProps {
  params: Promise<{
    itemId: string;
  }>;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Mock quiz data - in production, this would come from the database
const mockQuizzes: Record<string, QuizQuestion[]> = {
  intubation: [
    {
      id: '1',
      question: 'What is the most common complication during endotracheal intubation?',
      options: ['Hypotension', 'Esophageal intubation', 'Bradycardia', 'Hypertension'],
      correctAnswer: 1,
      explanation:
        'Esophageal intubation is the most common complication, occurring in 1-2% of cases.',
    },
    {
      id: '2',
      question: 'Which of the following is NOT a sign of correct endotracheal tube placement?',
      options: [
        'Bilateral chest rise',
        'End-tidal CO2 detection',
        'Gastric distension',
        'Bilateral breath sounds',
      ],
      correctAnswer: 2,
      explanation: 'Gastric distension indicates esophageal intubation, not correct placement.',
    },
  ],
  bronchospasm: [
    {
      id: '1',
      question: 'What is the first-line treatment for intraoperative bronchospasm?',
      options: ['Epinephrine', 'Albuterol', 'Corticosteroids', 'Antihistamines'],
      correctAnswer: 1,
      explanation: 'Albuterol (beta-2 agonist) is the first-line treatment for bronchospasm.',
    },
  ],
};

export default function QuizPage({ params }: QuizPageProps) {
  const [itemId, setItemId] = useState<string>('');

  useEffect(() => {
    params.then((resolvedParams) => {
      setItemId(resolvedParams.itemId);
    });
  }, [params]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) return;

    // In production, fetch quiz data from database
    const questions = mockQuizzes[itemId] || [];
    setQuizData(questions);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setLoading(false);
  }, [itemId]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: quizData.length,
      percentage: Math.round((correct / quizData.length) * 100),
    };
  };

  const handleSubmitQuiz = async () => {
    const { correct, total } = calculateScore();
    const passed = correct >= Math.ceil(total * 0.7); // 70% pass rate

    try {
      // In production, save to database
      const response = await fetch('/api/quiz-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          itemType: 'PROCEDURE', // or 'KNOWLEDGE' based on item
          passed,
          score: correct,
        }),
      });

      if (response.ok) {
        alert(`Quiz ${passed ? 'passed' : 'failed'}! Score: ${correct}/${total}`);
        window.close(); // Close the quiz window
      } else {
        alert('Error saving quiz results');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (quizData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <BackButton className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h1>
          <p className="text-gray-600 mb-4">No quiz available for this item.</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const { correct, total, percentage } = calculateScore();
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                passed ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <svg
                className={`w-8 h-8 ${passed ? 'text-green-600' : 'text-red-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {passed ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                )}
              </svg>
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? 'Quiz Passed!' : 'Quiz Failed'}
            </h1>
            <p className="text-gray-600 mb-6">
              You scored {correct} out of {total} questions ({percentage}%)
            </p>
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quizData[currentQuestion];
  if (!question) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Back Button */}
        <BackButton className="mb-6" />

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {currentQuestion + 1} of {quizData.length}
            </span>
            <span>{Math.round(((currentQuestion + 1) / quizData.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h2>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      selectedAnswers[currentQuestion] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === -1}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentQuestion === quizData.length - 1 ? 'Finish Quiz' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
