export function Footer() {
  return (
    <footer className="relative pt-32 pb-12 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div>
            <a href="/" className="text-2xl font-bold tracking-tighter mb-6 block flex items-center gap-2">
              <span>🎰</span>
              <span className="text-white">Lucky<span className="text-yellow-400">Fan</span></span>
            </a>
            <p className="text-white/50 leading-relaxed">
              Казино на фантики для нашего сообщества. Никаких реальных денег — только азарт и удовольствие!
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-6">Навигация</h4>
            <ul className="space-y-4 text-white/60">
              <li><a href="#games" className="hover:text-yellow-400 transition-colors">Слоты</a></li>
              <li><a href="#leaderboard" className="hover:text-yellow-400 transition-colors">Рейтинг</a></li>
              <li><a href="#how" className="hover:text-yellow-400 transition-colors">Как играть</a></li>
              <li><a href="#top" className="hover:text-yellow-400 transition-colors">Топ игроки</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6">Сообщество</h4>
            <ul className="space-y-4 text-white/60">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Telegram</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">VK</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Discord</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6">Начать играть</h4>
            <p className="text-white/60 mb-6">Регистрируйся и получи <span className="text-yellow-400 font-bold">1000 фантиков</span> на старт!</p>
            <button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
              Зарегистрироваться
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-white/40">
          <p>&copy; 2026 LuckyFan. Только для сообщества. Без реальных денег.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Правила игры</a>
            <a href="#" className="hover:text-white transition-colors">Конфиденциальность</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
