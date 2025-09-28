import useLocalStorage from './useLocalStorage';
import { UserProfile } from '../types';
import { getInitialUsers } from '../utils/users';

function useUsers(): [UserProfile[], React.Dispatch<React.SetStateAction<UserProfile[]>>] {
    const [users, setUsers] = useLocalStorage<UserProfile[]>('users', getInitialUsers);
    return [users, setUsers];
}

export default useUsers;
