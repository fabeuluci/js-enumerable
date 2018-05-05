export interface IEnumerable<T> {
    getEnumerator(): IEnumerator<T>;
    forEach(func: (v: T) => void): void;
    indexOf(finder: (v: T) => boolean): number;
    find(finder: (v: T) => boolean): T;
    findAll(finder: (v: T) => boolean): IEnumerable<T>;
    map<U>(mapper: (v: T) => U): IEnumerable<U>;
    max(comparator: (a: T, b: T) => number): T;
    min(comparator: (a: T, b: T) => number): T;
    contains(finder: (v: T) => boolean): boolean;
    containsValue(value: T): boolean;
    allPass(tester: (v: T) => boolean): boolean;
    empty(): boolean;
    length(): number;
    sort(comparator: (a: T, b: T) => number): IEnumerable<T>;
    toArray(): T[];
    first(): T;
    last(): T;
    nth(index: number): T;
    firstOrDefault(def: T): T;
    lastOrDefault(def: T): T;
    nthOrDefault(index: number, def: T): T;
    save(): IEnumerable<T>;
}

export interface IEnumerator<T> {
    next(): T;
    hasNext(): boolean;
}

export abstract class BaseEnumerable<T> implements IEnumerable<T> {
    
    abstract getEnumerator(): IEnumerator<T>;
    
    forEach(func: (v: T) => void): void {
        let enumerator = this.getEnumerator();
        while (enumerator.hasNext()) {
            func(enumerator.next());
        }
    }
    
    indexOf(finder: (v: T) => boolean): number {
        let i = 0;
        let enumerator = this.getEnumerator();
        while (enumerator.hasNext()) {
            let value = enumerator.next();
            if (finder(value)) {
                return i;
            }
            i++;
        }
        return -1;
    }
    
    find(finder: (v: T) => boolean): T {
        let enumerator = this.getEnumerator();
        while (enumerator.hasNext()) {
            let value = enumerator.next();
            if (finder(value)) {
                return value;
            }
        }
        return undefined;
    }
    
    findAll(finder: (v: T) => boolean): IEnumerable<T> {
        return new FindAllEnumerable(this, finder);
    }
    
    map<U>(mapper: (v: T) => U): IEnumerable<U> {
        return new MapEnumerable(this, mapper);
    }
    
    max(comparator: (a: T, b: T) => number): T {
        let hasValue = false;
        let max: T = undefined;
        let enumerator = this.getEnumerator();
        while (enumerator.hasNext()) {
            let value = enumerator.next();
            if (!hasValue || comparator(max, value) < 0) {
                hasValue = true;
                max = value;
            }
        }
        return max;
    }
    
    min(comparator: (a: T, b: T) => number): T {
        return this.max((a, b) => -comparator(a, b));
    }
    
    contains(finder: (v: T) => boolean): boolean {
        let enumerator = this.getEnumerator();
        while (enumerator.hasNext()) {
            let value = enumerator.next();
            if (finder(value)) {
                return true;
            }
        }
        return false;
    }
    
    containsValue(value: T): boolean {
        let enumerator = this.getEnumerator();
        while (enumerator.hasNext()) {
            if (enumerator.next() === value) {
                return true;
            }
        }
        return false;
    }
    
    allPass(tester: (v: T) => boolean): boolean {
        return !this.contains(x => !tester(x));
    }
    
    empty(): boolean {
        let enumerator = this.getEnumerator();
        return !enumerator.hasNext();
    }
    
    length(): number {
        let result = 0;
        let enumerator = this.getEnumerator();
        while (enumerator.hasNext()) {
            enumerator.next();
            result++;
        }
        return result;
    }
    
    sort(comparator: (a: T, b: T) => number): IEnumerable<T> {
        let array = this.toArray();
        array.sort(comparator);
        return new ArrayEnumerable(array);
    }
    
    toArray(): T[] {
        let result: T[] = [];
        let enumerator = this.getEnumerator();
        while (enumerator.hasNext()) {
            result.push(enumerator.next());
        }
        return result;
    }
    
    first(): T {
        let enumerator = this.getEnumerator();
        return enumerator.hasNext() ? enumerator.next() : undefined;
    }
    
    last(): T {
        let result: T = undefined;
        let enumerator = this.getEnumerator();
        while (enumerator.hasNext()) {
            result = enumerator.next();
        }
        return result;
    }
    
    nth(index: number): T {
        if (index < 0) {
            return undefined;
        }
        let i = 0;
        let enumerator = this.getEnumerator();
        while (enumerator.hasNext()) {
            let result = enumerator.next();
            if (i == index) {
                return result;
            }
            i++;
        }
        return undefined;
    }
    
    firstOrDefault(def: T): T {
        let val = this.first();
        return val == undefined ? def : val;
    }
    
    lastOrDefault(def: T): T {
        let val = this.last();
        return val == undefined ? def : val;
    }
    
    nthOrDefault(index: number, def: T): T {
        let val = this.nth(index);
        return val == undefined ? def : val;
    }
    
    save(): IEnumerable<T> {
        return new ArrayEnumerable(this.toArray());
    }
}

export class MapEnumerator<T, U> implements IEnumerator<U> {
    
    constructor(public enumerator: IEnumerator<T>, public mapper: (v: T) => U) {
    }
    
    next(): U {
        return this.mapper(this.enumerator.next());
    }
    
    hasNext(): boolean {
        return this.enumerator.hasNext();
    }
}

export class MapEnumerable<T, U> extends BaseEnumerable<U> {
    
    constructor(public enumerable: IEnumerable<T>, public mapper: (v: T) => U) {
        super();
    }
    
    getEnumerator(): IEnumerator<U> {
        return new MapEnumerator(this.enumerable.getEnumerator(), this.mapper);
    }
    
    empty(): boolean {
        return this.enumerable.empty();
    }
    
    length(): number {
        return this.enumerable.length();
    }
    
    first(): U {
        let val = this.enumerable.first();
        return val === undefined ? undefined : this.mapper(val);
    }
    
    last(): U {
        let val = this.enumerable.last();
        return val === undefined ? undefined : this.mapper(val);
    }
    
    nth(index: number): U {
        let val = this.enumerable.nth(index);
        return val === undefined ? undefined : this.mapper(val);
    }
}

export class FindAllEnumerator<T> implements IEnumerator<T> {
    
    consumed: boolean = true;
    hasNextValue: boolean;
    current: T;
    
    constructor(public enumerator: IEnumerator<T>, public finder: (v: T) => boolean) {
    }
    
    prepareNextValue(): void {
        if (!this.consumed) {
            return;
        }
        this.consumed = false;
        this.hasNextValue = false;
        this.current = null;
        while (this.enumerator.hasNext()) {
            let value = this.enumerator.next();
            if (this.finder(value)) {
                this.hasNextValue = true;
                this.current = value;
                return;
            }
        }
    }
    
    next(): T {
        this.prepareNextValue();
        this.consumed = true;
        return this.current;
    }
    
    hasNext(): boolean {
        this.prepareNextValue();
        return this.hasNextValue;
    }
}

export class FindAllEnumerable<T> extends BaseEnumerable<T> {
    
    constructor(public enumerable: IEnumerable<T>, public finder: (v: T) => boolean) {
        super();
    }
    
    getEnumerator(): IEnumerator<T> {
        return new FindAllEnumerator(this.enumerable.getEnumerator(), this.finder);
    }
}

export class ArrayEnumerator<T> implements IEnumerator<T> {
    
    constructor(public array: T[], public index: number) {
    }
    
    next(): T {
        return this.array[this.index++];
    }
    
    hasNext(): boolean {
        return this.index < this.array.length;
    }
}

export class ArrayEnumerable<T> extends BaseEnumerable<T> {
    
    constructor(public array: T[]) {
        super();
    }
    
    getEnumerator(): IEnumerator<T> {
        return new ArrayEnumerator(this.array, 0);
    }
    
    containsValue(value: T): boolean {
        return this.array.indexOf(value) != -1;
    }
    
    empty(): boolean {
        return this.array.length == 0;
    }
    
    length(): number {
        return this.array.length;
    }
    
    toArray(): T[] {
        return [].concat(this.array);
    }
    
    first(): T {
        return this.array[0];
    }
    
    last(): T {
        return this.array[this.array.length - 1];
    }
    
    nth(index: number): T {
        return this.array[index];
    }
}

export let $A = <T>(array: T[]) => new ArrayEnumerable(array);
