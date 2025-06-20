import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FaqSlider = () => {
  const faqs = [
    {
      question: 'What is Seamless',
      answer: 'This is a microservice designed for students of IIT Bhilai',
    },
    {
      question: 'How can we reach IIT Bhilai',
      answer: 'Come to durg railway station then take auto to IIT Bhilai',
    },
    {
      question: 'What is Seamless',
      answer: 'This is a microservice designed for students of IIT Bhilai',
    },
    {
      question: 'How can we reach IIT Bhilai',
      answer: 'Come to durg railway station then take auto to IIT Bhilai',
    },
    {
      question: 'What is Seamless',
      answer: 'This is a microservice designed for students of IIT Bhilai',
    },
    {
      question: 'How can we reach IIT Bhilai',
      answer: 'Come to durg railway station then take auto to IIT Bhilai',
    },
  ];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <div>
      <section className="w-full px-4 py-12">
        <h2 className="text-3xl font-semibold text-center mb-10">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm bg-white dark:bg-gray-900 transition"
            >
              <button
                onClick={() => toggle(index)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <p className="mt-3 text-gray-600 dark:text-gray-400">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default FaqSlider;
