import styles from './Button.module.css'

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
