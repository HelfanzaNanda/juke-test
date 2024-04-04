export type Category = {
    id : number;
    name : string;
    images : string;
}

export type Product = {
    id : number;
    title : string;
    price : number;
    description : string;
    category : Category;
    images : string[];
}


export type ParamsPaginate = {
    offset : number;
    limit : number;
}