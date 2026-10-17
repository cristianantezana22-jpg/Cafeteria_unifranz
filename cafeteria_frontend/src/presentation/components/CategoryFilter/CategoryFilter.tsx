import type { Category } from '../../../domain/models/Category'
import './category-filter.css'

type CategoryFilterProps = {
  categories: Category[]
  activeCategory: string
  onSelect: (categoryId: string) => void
}

export function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="category-filter" role="group" aria-label="Filtrar por categoría">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-pill${activeCategory === category.id ? ' is-active' : ''}`}
          type="button"
          aria-pressed={activeCategory === category.id}
          onClick={() => onSelect(category.id)}
        >
          {category.nombre}
        </button>
      ))}
    </div>
  )
}
