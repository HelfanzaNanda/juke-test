import useSWR, { KeyedMutator } from 'swr';
import camelcaseKeys from "camelcase-keys";
import { message, notification } from 'antd';
import { ApiClient } from '@/clients/ApiClient';
import { Category, ParamsPaginate, Product } from '@/types/product';
import qs from "qs";


interface Props {
    swr?: boolean;
    callback?: Function;
    limit?: number;
    offset?: number;
}

export const useCategory = (props: Props) => {

    const { swr, callback, limit, offset } = props;
    const path = `categories`;
    const object: ParamsPaginate = {
        limit : limit || 10,
        offset : offset || 10,
    };
    let error: any = null;
    let mutate: KeyedMutator<Array<Category>>;
    const params = qs.stringify(object);
    let response: Array<Category> = [];
    if (swr) {
        const { data: resp, error: err, mutate: mtt } = useSWR<Array<Category>>(`${path}`, ApiClient.fetcher, {
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

    return { data };
};