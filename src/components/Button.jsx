import styles from './Button.module.css'

// A styled <button>. `variant` picks the look (primary / ghost / danger),
// `size="big"` is for the main call-to-action, `full` makes it full-width.
// Any other prop (onClick, type, disabled, aria-*) passes straight through.
export function Button({ variant = 'primary', size, full = false, className = '', children, ...rest }) {
  const classes = [
    styles.btn,
    styles[variant],
    size === 'big' && styles.big,
    full && styles.full,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
