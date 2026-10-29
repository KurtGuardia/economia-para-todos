export type BoliviaDepartment = {
  name: string
  municipalities: readonly string[]
}

/**
 * Local registration geography for the demo. Keep municipalities grouped by
 * department so the form can grow without coupling location data to the UI.
 */
export const boliviaLocations: readonly BoliviaDepartment[] = [
  { name: 'Beni', municipalities: ['Trinidad', 'Riberalta', 'Guayaramerín'] },
  { name: 'Chuquisaca', municipalities: ['Sucre', 'Monteagudo', 'Camargo'] },
  { name: 'Cochabamba', municipalities: ['Cochabamba', 'Quillacollo', 'Sacaba'] },
  { name: 'La Paz', municipalities: ['La Paz', 'El Alto', 'Viacha', 'Achocalla', 'Copacabana'] },
  { name: 'Oruro', municipalities: ['Oruro', 'Challapata', 'Huanuni'] },
  { name: 'Pando', municipalities: ['Cobija', 'Porvenir', 'Puerto Rico'] },
  { name: 'Potosí', municipalities: ['Potosí', 'Uyuni', 'Villazón'] },
  { name: 'Santa Cruz', municipalities: ['Santa Cruz de la Sierra', 'Montero', 'Warnes', 'Cotoca'] },
  { name: 'Tarija', municipalities: ['Tarija', 'Yacuiba', 'Bermejo'] },
] as const

export function getMunicipalities(department: string) {
  return boliviaLocations.find((item) => item.name === department)?.municipalities ?? []
}
