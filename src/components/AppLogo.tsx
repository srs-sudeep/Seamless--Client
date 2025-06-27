import { cn } from '@/lib/utils';
import { useTheme } from '@/theme';
import { useNavigate } from 'react-router-dom';

interface AppLogoProps {
  className?: string;
  horizontal?: boolean;
  name?: boolean;
  short?: boolean;
  imgClassname?: string;
}

const getLogoSrc = (
  theme: string,
  horizontal?: boolean,
  name?: boolean,
  short?: boolean
): string => {
  if (horizontal) {
    return theme === 'dark' ? './WhiteLogoHorizontal.svg' : './LogoHorizontal.svg';
  } else if (name) {
    return theme === 'dark' ? './WhiteLongName.svg' : './LongName.svg';
  } else if (short) {
    return theme === 'dark' ? './WhiteX.svg' : './X.svg';
  }
  return theme === 'dark' ? './WhiteX.svg' : './X.svg';
};

const AppLogo = ({
  className,
  horizontal = false,
  name = false,
  short = false,
  imgClassname,
}: AppLogoProps) => {
  const { theme } = useTheme();
  const logoSrc = getLogoSrc(theme, horizontal, name, short);
  const navigate = useNavigate();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <img
          src={logoSrc}
          alt="Logo"
          className={cn('object-contain cursor-pointer', imgClassname)}
          onClick={() => navigate('/')}
        />
      </div>
    </div>
  );
};

export { AppLogo };
