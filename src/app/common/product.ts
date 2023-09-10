export class Product {
    id!: string;
    sku!: string;
    name!: string;
    description!: string;
    unitPrice!: number;
    imageUrl!: string;
    active!: boolean;
    unitsInStock!: number;
    dateCreated!: Date;
    lastUpdate!: Date;
    // constructor(
    //     public id: string,
    //     public sku: string,
    //     public name: string,
    //     public description: string,
    //     public unitPrice: number,
    //     public imageUrl: string,
    //     public active: boolean,
    //     public unitsInStock: number,
    //     public dateCreated: Date,
    //     public lastUpdated: Date
    // ) {}
}
