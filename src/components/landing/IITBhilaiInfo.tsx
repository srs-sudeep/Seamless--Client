import { ScrollText, Landmark, BookOpenCheck } from 'lucide-react';

const IITBhilaiInfo = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-gray-900 text-gray-800 dark:text-white">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium mb-6">
          <Landmark className="w-4 h-4" />
          About the Institute
        </div>

        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Indian Institute of Technology Bhilai
        </h2>

        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 text-gray-700 dark:text-gray-300 leading-relaxed">
          Established in 2016, IIT Bhilai is one of India’s youngest and fastest-growing IITs.
          Located in the heart of Chhattisgarh, the institute is dedicated to fostering innovation,
          research, and entrepreneurship in an inclusive academic environment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur shadow-md">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-purple-500/80 text-white">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Academic Excellence</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Offering BTech, MTech, MSc, and PhD programs across engineering and science
              disciplines with a strong emphasis on interdisciplinary learning.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur shadow-md">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-pink-500/80 text-white">
              <ScrollText className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Vibrant Campus Life</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              The permanent campus in Kutelabhata is rapidly expanding, blending modern
              infrastructure with serene nature to foster creativity and community.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur shadow-md">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-blue-500/80 text-white">
              <Landmark className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Innovation First</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              From research labs to national-level hackathons and tech meets, IIT Bhilai encourages
              students to solve real-world challenges through technology.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IITBhilaiInfo;
