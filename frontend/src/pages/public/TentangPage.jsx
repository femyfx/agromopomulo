import { TreePine, Target, Users, Leaf, Globe, Award } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';

export const TentangPage = () => {
  return (
    <div className="min-h-screen" data-testid="tentang-page">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 to-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="overline mb-4">TENTANG PROGRAM</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight mb-6">
              Program Agro Mopomulo
            </h1>
            <p className="text-lg text-slate-600">
              Gerakan penghijauan yang mengajak seluruh ASN dan masyarakat 
              Kabupaten Gorontalo Utara untuk menanam pohon demi masa depan yang lebih hijau.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What is Mopomulo */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title mb-6">Apa itu Mopomulo?</h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                <strong>Mopomulo</strong> berasal dari bahasa Gorontalo yang berarti "menanam". 
                Program Agro Mopomulo adalah inisiatif Pemerintah Kabupaten Gorontalo Utara 
                untuk meningkatkan kesadaran dan partisipasi masyarakat dalam pelestarian lingkungan.
              </p>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Dengan konsep <strong>"Satu Orang Sepuluh Pohon"</strong>, program ini menargetkan 
                setiap ASN dan warga untuk berkontribusi menanam minimal 10 pohon, baik pohon 
                produktif maupun pohon pelindung.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Program ini tidak hanya berfokus pada kuantitas pohon yang ditanam, tetapi juga 
                pada keberlanjutan dan pemeliharaan pohon hingga tumbuh dengan baik.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1631401551847-78450ef649d8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxzZWVkbGluZyUyMGluJTIwaGFuZHxlbnwwfHx8fDE3Njg0NDU4MTh8MA&ixlib=rb-4.1.0&q=85"
                alt="Bibit tanaman"
                className="rounded-2xl shadow-xl w-full h-[350px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="overline mb-4">VISI & MISI</p>
            <h2 className="section-title">Tujuan Program</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="stat-card">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Visi</h3>
                <p className="text-slate-600 leading-relaxed">
                  Mewujudkan Kabupaten Gorontalo Utara sebagai daerah yang hijau, asri, 
                  dan berkelanjutan dengan partisipasi aktif seluruh lapisan masyarakat 
                  dalam pelestarian lingkungan.
                </p>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
                  <Award className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Misi</h3>
                <ul className="text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Leaf className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Meningkatkan kesadaran lingkungan masyarakat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Leaf className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Memperluas area hijau di seluruh wilayah</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Leaf className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Mendukung ketahanan pangan daerah</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Leaf className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Membangun budaya peduli lingkungan</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="overline mb-4">MANFAAT</p>
            <h2 className="section-title">Mengapa Program Ini Penting?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: 'Lingkungan',
                description: 'Mengurangi polusi udara, menyerap karbon, dan menjaga keseimbangan ekosistem lokal.',
                color: 'emerald'
              },
              {
                icon: Users,
                title: 'Sosial',
                description: 'Membangun kebersamaan dan gotong royong dalam masyarakat melalui kegiatan menanam.',
                color: 'amber'
              },
              {
                icon: TreePine,
                title: 'Ekonomi',
                description: 'Pohon produktif dapat menjadi sumber pendapatan tambahan bagi masyarakat.',
                color: 'blue'
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="stat-card h-full">
                  <CardContent className="p-8 text-center">
                    <div className={`h-16 w-16 rounded-xl bg-${item.color}-100 flex items-center justify-center mx-auto mb-6`}>
                      <item.icon className={`h-8 w-8 text-${item.color}-600`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Participate */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-emerald-200 text-xs uppercase tracking-widest font-medium mb-4">CARA BERPARTISIPASI</p>
            <h2 className="text-3xl font-bold text-white tracking-tight">Langkah Mudah Ikut Program</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Daftar', desc: 'Isi form partisipasi online' },
              { step: '2', title: 'Pilih Pohon', desc: 'Tentukan jenis pohon yang akan ditanam' },
              { step: '3', title: 'Tanam', desc: 'Lakukan penanaman di lokasi yang ditentukan' },
              { step: '4', title: 'Laporkan', desc: 'Dokumentasikan dan laporkan progress' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="h-16 w-16 rounded-full bg-white text-emerald-600 text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-emerald-100 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
