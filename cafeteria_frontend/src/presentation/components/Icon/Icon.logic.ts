export type IconName =
  | 'clock'
  | 'flame'
  | 'bell'
  | 'check'
  | 'ticket'
  | 'lock'
  | 'utensils'
  | 'user'
  | 'wallet'
  | 'x'
  | 'arrow-right'
  | 'refresh'
  | 'store'
  | 'list'

export type IconProps = {
  name: IconName
  size?: number
  className?: string
}

export const ICON_PATHS: Record<IconName, string[]> = {
  clock: ['M12 7v5l3 2', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'],
  flame: [
    'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2.2C11 8.5 11 5.5 12 3z',
  ],
  bell: ['M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7', 'M10 20a2 2 0 0 0 4 0'],
  check: ['M20 6 9 17l-5-5'],
  ticket: [
    'M3 8a2 2 0 0 0 0 4v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4a2 2 0 0 1 0-4V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z',
    'M14 5v12',
  ],
  lock: ['M6 11h12v9H6z', 'M8 11V8a4 4 0 0 1 8 0v3'],
  utensils: ['M7 3v8', 'M4 3v5a3 3 0 0 0 6 0V3', 'M7 11v10', 'M17 3c-2 2-3 5-3 8h3v10'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
  wallet: ['M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M3 7l12-3v3', 'M16 14h2'],
  x: ['M18 6 6 18', 'M6 6l12 12'],
  'arrow-right': ['M5 12h14', 'M13 6l6 6-6 6'],
  refresh: ['M20 11a8 8 0 0 0-14-4L4 9', 'M4 4v5h5', 'M4 13a8 8 0 0 0 14 4l2-2', 'M20 20v-5h-5'],
  store: ['M4 9l1-5h14l1 5', 'M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 6 0 2.5 2.5 0 0 0 5 0', 'M5 12v8h14v-8'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3.5 6h.01', 'M3.5 12h.01', 'M3.5 18h.01'],
}
