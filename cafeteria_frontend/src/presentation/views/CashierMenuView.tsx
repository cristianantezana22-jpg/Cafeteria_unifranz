import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type {
  MenuCategory,
  MenuProduct,
  MenuProductRequest,
} from '../../domain/models'
import {
  createMenuProduct,
  deleteMenuProduct,
  getCurrentSession,
  getMenuCategories,
  getMenuProducts,
  updateMenuProduct,
} from '../../infrastructure/api/cafeteria'
import './cashier-menu-view.css'

type Section = 'menu' | 'categories'
type MenuForm = {
  name: string
  categoryId: string
  price: string
  featured: boolean
}
type CashierMenuViewProps = {
  onBackToOrders: () => void
  onLogout: () => void
}

const emptyForm: MenuForm = {
  name: '',
  categoryId: '',
  price: '',
  featured: false,
}

function formatPrice(price: number) {
  return `Bs ${price.toFixed(2)}`
}

export function CashierMenuView({ onBackToOrders, onLogout }: CashierMenuViewProps) {
  const session = getCurrentSession()
  const [section, setSection] = useState<Section>('menu')
  const [products, setProducts] = useState<MenuProduct[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MenuProduct | null>(null)
  const [form, setForm] = useState<MenuForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadMenu() {
    setIsLoading(true)
    setError('')
    try {
      const [menuProducts, menuCategories] = await Promise.all([
        getMenuProducts(),
        getMenuCategories(),
      ])
      setProducts(menuProducts)
      setCategories(menuCategories)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el menú.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadMenu()
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()
    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLocaleLowerCase().includes(normalizedSearch) ||
        product.category.toLocaleLowerCase().includes(normalizedSearch)
      const matchesCategory =
        categoryFilter === 'all' || String(product.categoryId) === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [categoryFilter, products, search])

  function openCreateForm() {
    setEditingProduct(null)
    setForm({ ...emptyForm, categoryId: categories[0] ? String(categories[0].id) : '' })
    setError('')
    setIsFormOpen(true)
  }

  function openEditForm(product: MenuProduct) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      categoryId: String(product.categoryId),
      price: String(product.price),
      featured: product.featured,
    })
    setError('')
    setIsFormOpen(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    const request: MenuProductRequest = {
      name: form.name.trim(),
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      featured: form.featured,
    }

    try {
      if (editingProduct) {
        const updated = await updateMenuProduct(editingProduct.id, request)
        setProducts((current) =>
          current.map((product) => (product.id === updated.id ? updated : product)),
        )
        setNotice('El producto se actualizó correctamente.')
      } else {
        const created = await createMenuProduct(request)
        setProducts((current) => [created, ...current])
        setNotice('El producto se agregó al menú.')
      }
      setIsFormOpen(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el producto.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(product: MenuProduct) {
    if (!window.confirm(`¿Eliminar "${product.name}" del menú?`)) return
    setDeletingId(product.id)
    setError('')
    setNotice('')
    try {
      await deleteMenuProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setNotice('El producto se eliminó del menú.')
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el producto.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="cashier-menu-dashboard">
      <aside className="cashier-menu-sidebar">
        <div className="cashier-menu-brand">
          <span className="cashier-menu-brand-mark">C</span>
          <span>
            <strong>CAFETERÍA</strong>
            <small>UNIFRANZ · CAJA</small>
          </span>
        </div>

        <div className="cashier-menu-nav-label">CAJA</div>
        <nav className="cashier-menu-navigation" aria-label="Navegación de caja">
          <button className="cashier-menu-nav-item" onClick={onBackToOrders} type="button">
            <span aria-hidden="true">▤</span>
            Pedidos
          </button>
          <button
            className={section === 'menu' ? 'cashier-menu-nav-item is-active' : 'cashier-menu-nav-item'}
            onClick={() => setSection('menu')}
            type="button"
          >
            <span aria-hidden="true">▦</span>
            Menú
          </button>
          <button
            className={
              section === 'categories' ? 'cashier-menu-nav-item is-active' : 'cashier-menu-nav-item'
            }
            onClick={() => setSection('categories')}
            type="button"
          >
            <span aria-hidden="true">◫</span>
            Categorías
            <span className="cashier-menu-nav-count">{categories.length}</span>
          </button>
        </nav>

        <div className="cashier-menu-sidebar-bottom">
          <div className="cashier-menu-profile">
            <span className="cashier-menu-avatar">
              {(session?.customer.name ?? 'C').slice(0, 1).toUpperCase()}
            </span>
            <span className="cashier-menu-profile-copy">
              <strong>{session?.customer.name ?? 'Cajero'}</strong>
              <small>Cajero</small>
            </span>
          </div>
          <button className="cashier-menu-logout" onClick={onLogout} type="button">
            <span aria-hidden="true">↪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <section className="cashier-menu-main">
        <header className="cashier-menu-topbar">
          <div className="cashier-menu-breadcrumb">Caja <span>/</span> Gestión del menú</div>
          <div className="cashier-menu-topbar-date">
            <span className="cashier-menu-status-dot" />
            Sistema activo
          </div>
        </header>

        <div className="cashier-menu-content">
          <div className="cashier-menu-page-heading">
            <div>
              <p className="cashier-menu-eyebrow">GESTIÓN DE CAJA</p>
              <h1>{section === 'menu' ? 'Gestión del menú' : 'Categorías'}</h1>
              <p className="cashier-menu-page-subtitle">
                {section === 'menu'
                  ? 'Administra los productos disponibles en tu cafetería.'
                  : 'Consulta las categorías disponibles para organizar el menú.'}
              </p>
            </div>
            {section === 'menu' && (
              <button
                className="cashier-menu-primary-button"
                disabled={categories.length === 0}
                onClick={openCreateForm}
                type="button"
              >
                <span aria-hidden="true">+</span>
                Agregar menú
              </button>
            )}
          </div>

          {error && !isFormOpen && (
            <div className="cashier-menu-alert cashier-menu-alert-error" role="alert">
              <span>{error}</span>
              <button onClick={() => void loadMenu()} type="button">Reintentar</button>
            </div>
          )}
          {notice && <div className="cashier-menu-alert cashier-menu-alert-success" role="status">{notice}</div>}

          <div className="cashier-menu-stats">
            <article className="cashier-menu-stat-card">
              <span className="cashier-menu-stat-icon stat-icon-violet">▦</span>
              <span className="cashier-menu-stat-label">PRODUCTOS EN MENÚ</span>
              <strong>{products.length}</strong>
              <small>Productos registrados</small>
            </article>
            <article className="cashier-menu-stat-card">
              <span className="cashier-menu-stat-icon stat-icon-peach">◫</span>
              <span className="cashier-menu-stat-label">CATEGORÍAS</span>
              <strong>{categories.length}</strong>
              <small>Grupos disponibles</small>
            </article>
            <article className="cashier-menu-stat-card">
              <span className="cashier-menu-stat-icon stat-icon-green">✦</span>
              <span className="cashier-menu-stat-label">MENÚ DESTACADO</span>
              <strong>{products.filter((product) => product.featured).length}</strong>
              <small>Productos del día</small>
            </article>
          </div>

          {section === 'menu' ? (
            <section className="cashier-menu-panel">
              <div className="cashier-menu-panel-heading">
                <div>
                  <h2>Productos</h2>
                  <p>Consulta y actualiza los productos de tu menú.</p>
                </div>
                <span className="cashier-menu-results-count">{filteredProducts.length} productos</span>
              </div>
              <div className="cashier-menu-toolbar">
                <label className="cashier-menu-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    aria-label="Buscar productos"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar producto..."
                    value={search}
                  />
                </label>
                <label className="cashier-menu-filter">
                  <span>Filtrar por</span>
                  <select
                    aria-label="Filtrar por categoría"
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    value={categoryFilter}
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              {isLoading ? (
                <div className="cashier-menu-empty-state">Cargando productos...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="cashier-menu-empty-state">
                  <span className="cashier-menu-empty-icon">▦</span>
                  <strong>{products.length ? 'No encontramos productos' : 'Tu menú está vacío'}</strong>
                  <p>
                    {products.length
                      ? 'Prueba con otra búsqueda o categoría.'
                      : 'Agrega el primer producto para comenzar.'}
                  </p>
                  {!products.length && (
                    <button className="cashier-menu-text-button" onClick={openCreateForm} type="button">
                      Agregar menú
                    </button>
                  )}
                </div>
              ) : (
                <div className="cashier-menu-table-wrap">
                  <table className="cashier-menu-table">
                    <thead>
                      <tr>
                        <th>PRODUCTO</th>
                        <th>CATEGORÍA</th>
                        <th>PRECIO</th>
                        <th>ESTADO</th>
                        <th className="cashier-menu-actions-heading">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div className="cashier-menu-product-cell">
                              <span className="cashier-menu-product-avatar">
                                {product.name.slice(0, 1).toUpperCase()}
                              </span>
                              <strong>{product.name}</strong>
                            </div>
                          </td>
                          <td><span className="cashier-menu-category-tag">{product.category}</span></td>
                          <td className="cashier-menu-price">{formatPrice(product.price)}</td>
                          <td>
                            <span className={product.featured ? 'cashier-menu-badge is-featured' : 'cashier-menu-badge'}>
                              <span />
                              {product.featured ? 'Destacado' : 'Disponible'}
                            </span>
                          </td>
                          <td>
                            <div className="cashier-menu-row-actions">
                              <button
                                aria-label={`Editar ${product.name}`}
                                className="cashier-menu-icon-button"
                                onClick={() => openEditForm(product)}
                                title="Editar"
                                type="button"
                              >
                                ✎
                              </button>
                              <button
                                aria-label={`Eliminar ${product.name}`}
                                className="cashier-menu-icon-button is-delete"
                                disabled={deletingId === product.id}
                                onClick={() => void handleDelete(product)}
                                title="Eliminar"
                                type="button"
                              >
                                {deletingId === product.id ? '…' : '⌫'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : (
            <section className="cashier-menu-panel cashier-menu-category-panel">
              <div className="cashier-menu-panel-heading">
                <div>
                  <h2>Categorías del menú</h2>
                  <p>Las categorías disponibles para clasificar los productos.</p>
                </div>
                <span className="cashier-menu-results-count">{categories.length} categorías</span>
              </div>
              {categories.length ? (
                <div className="cashier-menu-category-grid">
                  {categories.map((category, index) => (
                    <article className="cashier-menu-category-card" key={category.id}>
                      <span className={`cashier-menu-category-icon category-icon-${index % 3}`}>◫</span>
                      <div>
                        <strong>{category.name}</strong>
                        <span>
                          {products.filter((product) => product.categoryId === category.id).length}{' '}
                          productos
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="cashier-menu-empty-state">No hay categorías registradas.</div>
              )}
            </section>
          )}
        </div>
      </section>

      {isFormOpen && (
        <div
          className="cashier-menu-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) setIsFormOpen(false)
          }}
        >
          <section
            aria-labelledby="cashier-menu-form-title"
            aria-modal="true"
            className="cashier-menu-modal"
            role="dialog"
          >
            <div className="cashier-menu-modal-heading">
              <div>
                <p className="cashier-menu-eyebrow">{editingProduct ? 'ACTUALIZAR MENÚ' : 'NUEVO PRODUCTO'}</p>
                <h2 id="cashier-menu-form-title">{editingProduct ? 'Editar producto' : 'Agregar menú'}</h2>
              </div>
              <button
                aria-label="Cerrar formulario"
                className="cashier-menu-modal-close"
                disabled={isSaving}
                onClick={() => setIsFormOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            {error && <div className="cashier-menu-alert cashier-menu-alert-error" role="alert">{error}</div>}
            <form className="cashier-menu-form" onSubmit={(event) => void handleSubmit(event)}>
              <label>
                Nombre del producto
                <input
                  autoFocus
                  maxLength={120}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Ej. Sándwich de pollo"
                  required
                  value={form.name}
                />
              </label>
              <label>
                Categoría
                <select
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  required
                  value={form.categoryId}
                >
                  <option disabled value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Precio (Bs)
                <input
                  inputMode="decimal"
                  min="0.01"
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  placeholder="0.00"
                  required
                  step="0.01"
                  type="number"
                  value={form.price}
                />
              </label>
              <label className="cashier-menu-featured-toggle">
                <input
                  checked={form.featured}
                  onChange={(event) => setForm({ ...form, featured: event.target.checked })}
                  type="checkbox"
                />
                <span>
                  <strong>Producto del día</strong>
                  <small>Mostrar como parte del menú destacado.</small>
                </span>
              </label>
              <div className="cashier-menu-form-actions">
                <button
                  className="cashier-menu-secondary-button"
                  disabled={isSaving}
                  onClick={() => setIsFormOpen(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button className="cashier-menu-primary-button" disabled={isSaving} type="submit">
                  {isSaving ? 'Guardando...' : editingProduct ? 'Guardar cambios' : 'Agregar producto'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
