import wlogo from '../../../assets/wlogo.png'

function SideMenu({ items, activeTab, onChangeTab, onLogout, className = '' }) {
  return (
    <aside className={`flex h-full flex-col border-r border-blue-900/60 bg-slate-950/90 ${className}`}>
      <div className="border-b border-blue-900/60 p-5">
        <img src={wlogo} alt="World Cup USA Betting logo" className="mx-auto h-20 w-auto" />
        <p className="mt-3 text-center text-xs font-semibold uppercase tracking-widest text-red-200">CrownKick League</p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {items.map((item) => {
          const selected = item.id === activeTab
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                selected
                  ? 'bg-gradient-to-r from-blue-700 to-blue-500 text-white'
                  : 'text-blue-100/90 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-blue-900/60 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg border border-red-400/70 bg-red-600/20 px-4 py-3 text-sm font-medium text-red-100 hover:bg-red-600/35"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

export default SideMenu
