import { DataBiGroupCount, DataEntity, DataGroupCount } from './app.interfaces';

export function dataEntriesToGroupsCountMap(fieldName: string) {
  return (d: DataEntity[]) => {
    return d.reduce<Map<string, number>>((map, row) => {
      if (!row[fieldName]) {
        return map;
      }
      if (map.has(row[fieldName])) {
        map.set(row[fieldName], (map.get(row[fieldName]) as number) + 1);
      } else {
        map.set(row[fieldName], 1);
      }
      return map;
    }, new Map())
  }
}

export function groupsCountMapToOrderedDataGroupCount(order: string[]) {
  return (m: Map<string, number>) => {
    if (m.size === 0) {
      return [];
    }
    return [
      ...order
    ].map<DataGroupCount>((i) => [i, m.get(i) || 0]);
  }
}

export function groupsCountMapToDataBiGroupCount(name0: string, name1: string) {
  return (m: Map<string, number>) => {
    const counts: DataBiGroupCount = [
      [name1, m.get('1') || 0], [name0, m.get('0') || 0]
    ];
    return counts;
  }
}