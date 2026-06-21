export const formatIndonesianDate = (date = new Date()) =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)

export const todayLabel = () => formatIndonesianDate(new Date())
