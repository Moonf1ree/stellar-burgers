import { FC, SyntheticEvent, useState } from 'react';
import { LoginUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import { loginUser } from '../../services/slices';
import { useLocation, useNavigate } from 'react-router-dom';

export const Login: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loginError = useSelector((state) => state.auth.loginError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const from = (location.state as { from?: { pathname?: string } })?.from
      ?.pathname;
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        navigate(from || '/', { replace: true });
      })
      .catch(() => undefined);
  };

  return (
    <LoginUI
      errorText={loginError || undefined}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
