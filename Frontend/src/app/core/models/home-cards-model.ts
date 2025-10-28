
export interface DiscoverCards{
    id: string;
    title: string;
    image: string;
    type?: string;
}

export interface PopularCards{
    id: string; 
    title: string;
    image: string;
    type?: string;
}

export interface UniqueCards{
    id: string; 
    title: string;
    hotelName: string;
    city: string;
    rating: number;
    originalPrice: number;
    offerPrice: number;
    image: string;
    type?: string;
}

export interface TopDealCards{
    id: string; 
    title: string;
    hotelName: string;
    city: string;
    rating: number;
    originalPrice: number;
    offerPrice: number;
    image: string;
    type?: string;
}