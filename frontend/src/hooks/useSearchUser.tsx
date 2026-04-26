import { useState } from 'react';
import { MOCK_USERS } from '@/data/mockUsers';

export default function useSearchUser() {
  const [inputUserValue, setInputUserValue] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState(MOCK_USERS);

  const handleSearch = (text: string) => {
    setInputUserValue(text);

    if (text) {
      const newData = MOCK_USERS.filter(item => {
        const itemData = item.username
          ? item.username.toUpperCase()
          : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredUsers(newData);
    } else {
      setFilteredUsers(MOCK_USERS);
    }
  };

  return {
    inputUserValue,
    filteredUsers,
    handleSearch,
  };
}
