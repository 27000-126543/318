import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Flame, Clock, Globe, ChevronRight } from 'lucide-react'
import { useGovStore } from '@/stores/govStore'
import { cn } from '@/lib/utils'

const categories = ['全部', '社保服务', '住房服务', '税务服务', '户政服务', '交通服务', '医疗服务', '民政服务', '商事服务']

export default function Services() {
  const services = useGovStore((s) => s.services)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchText, setSearchText] = useState('')

  const filtered = useMemo(() => {
    let result = services
    if (activeCategory !== '全部') {
      result = result.filter((s) => s.category === activeCategory)
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(keyword) ||
          s.department.toLowerCase().includes(keyword) ||
          s.description.toLowerCase().includes(keyword)
      )
    }
    return result
  }, [services, activeCategory, searchText])

  return (
    <div className="flex gap-6">
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="gov-card sticky top-6">
          <h3 className="font-serif text-base font-semibold text-gray-800 mb-4">服务分类</h3>
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeCategory === cat
                      ? 'bg-govBlue/10 text-govBlue'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
                activeCategory === cat
                  ? 'bg-govBlue text-white border-govBlue'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-govBlue/30'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索服务名称、部门或关键词..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="gov-input pl-10"
          />
        </div>

        <div className="mb-4 text-sm text-gray-500">
          共 <span className="font-medium text-gray-800">{filtered.length}</span> 项服务
        </div>

        {filtered.length === 0 ? (
          <div className="gov-card text-center py-16">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">未找到相关服务</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="gov-card group hover:shadow-md hover:border-govBlue/20 transition-all duration-200 block"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-serif font-semibold text-gray-800 group-hover:text-govBlue transition-colors">
                    {service.name}
                  </h4>
                  {service.onlineOnly && (
                    <span className="shrink-0 ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-govGreen/10 text-govGreen border border-govGreen/20">
                      <Globe className="h-3 w-3" />
                      网办
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {service.description}
                </p>

                <p className="text-xs text-gray-400 mb-3">{service.department}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      {service.avgProcessingDays}个工作日
                    </span>
                    <span className="flex items-center gap-1 text-xs text-govOrange">
                      <Flame className="h-3.5 w-3.5" />
                      {service.heat}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-govBlue transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
