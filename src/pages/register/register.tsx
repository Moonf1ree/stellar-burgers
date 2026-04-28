import { FC, SyntheticEvent, useState } from 'react';
import { RegisterUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import { registerUser } from '../../services/slices';
import { useNavigate } from 'react-router-dom';

export const Register: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const registerError = useSelector((state) => state.auth.registerError);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    dispatch(registerUser({ email, password, name: userName }))
      .unwrap()
      .then(() => {
        navigate('/', { replace: true });
      })
      .catch(() => undefined);
  };

  return (
    <RegisterUI
      errorText={registerError || undefined}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
