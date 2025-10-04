import { Dispatch, SetStateAction } from 'react';
import useLocalStorage from './useLocalStorage';
import { UserProfile } from '../types';
import { getInitialUsers } from '../utils/users';

// Fix: Imported Dispatch and SetStateAction and used them to type the return value.
function useUsers(): [UserProfile[], Dispatch<SetStateAction<UserProfile[]>>] {
    const [users, setUsers] = useLocalStorage<UserProfile[]>('users', getInitialUsers);
    return [users, setUsers];
}

export default useUsers;