interface Array<T> {
    groupBy<TKey>(keyExtractor: (el: T) => TKey): Array<{key: TKey, values: T[]}>;
    includes(searchElement : T, fromIndex? : number);
}

