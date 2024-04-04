import useSWR, { KeyedMutator } from 'swr';
import camelcaseKeys from "camelcase-keys";
import { message, notification } from 'antd';
import { ApiClient } from '@/clients/ApiClient';
import { ParamsPaginate, Product } from '@/types/product';
import qs from "qs";


interface Props {
    swr?: boolean;
    callback?: Function;
    limit?: number;
    offset?: number;
}

export const useProduct = (props: Props) => {

    const { swr, callback, limit, offset } = props;
    const path = `products`;
    const object: ParamsPaginate = {
        limit : limit || 10,
        offset : offset || 10,
    };
    let error: any = null;
    let mutate: KeyedMutator<Array<Product>>;
    const params = qs.stringify(object);
    let response: Array<Product> = [];
    if (swr) {
        const { data: resp, error: err, mutate: mtt } = useSWR<Array<Product>>(`${path}?${params}`, ApiClient.fetcher, {
            // onSuccess: (data, key) => {
            //     if (!data?.status) {
            //         message.error(data?.message);
            //     }
            //     if (callback) callback();
            // },
        });
        
        response = resp!!;
        error = err;
        mutate = mtt;
    }

    const data = camelcaseKeys(response);


    const create = async (params: Event) => {
        const {response, status } = await ApiClient.request<Event>(`${path}`, ApiClient.METHOD_POST, params);
        if (!status) {
            const message = response.message;
            notification.error({ message })
            throw new Error(message);
        }
        notification.info({
            message: 'create product successfully'
        });
        mutate.apply(`${path}`);
    };

    const find = async (id: Number) => {
        const {response, status} = await ApiClient.request<Product>(`${path}/${id}`, ApiClient.METHOD_GET);
        
        if (!status) {
            const message = response.message;
            notification.error({ message })
            throw new Error(message);
        }
        return response;
    };

    const update = async (id: Number, params: Product) => {
        const {response, status} = await ApiClient.request<Product>(`${path}/${id}`, ApiClient.METHOD_PUT, params);
        if (!status) {
            const message = response.message;
            notification.error({ message })
            throw new Error(message);
        }
        notification.info({
            message: 'update product successfully'
        });
        mutate.apply(`${path}`);

    };

    const remove = async (id: number) => {
        const {response, status} = await ApiClient.request<Product>(`${path}/${id}`, ApiClient.METHOD_DELETE);
        if (!status) {
            const message = response.message;
            notification.error({ message })
            throw new Error(message);
        }
        notification.info({
            message: 'delete product successfully'
        });
        mutate.apply(`${path}`);
    };

    return { data, error, create, find, update, remove };
};