// styles
import styles from '../assets/styles/modules/nav.module.css';

// svgs, images
import logo from '../assets/svg/logo.svg';
import avatar from '../assets/img/image-avatar.jpg';
import sunSvg from '../assets/svg/icon-sun.svg';
import moonSvg from '../assets/svg/icon-moon.svg';

// utils
import useDarkModeToggle from '../hooks/useDarkMode';

const Navbar = () => {
	const { isDarkMode, toggleTheme } = useDarkModeToggle();

	const handleToggleDarkMode = () => {
		toggleTheme();
	};

	return (
		<div className={styles.nav}>
			<div className={styles.logo}>
				<img
					src={logo}
					alt='logo'
				/>
			</div>

			<div className={styles.wrapper}>
				<button
					type='button'
					className={styles.darkmodeToggle}
					onClick={handleToggleDarkMode}
					aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
					aria-pressed={isDarkMode}
				>
					<img
						src={isDarkMode ? sunSvg : moonSvg}
						alt=''
					/>
				</button>
				<div className={styles.imgContainer}>
					<img
						src={avatar}
						alt='profile picture'
					/>
				</div>
			</div>
		</div>
	);
};

export default Navbar;
