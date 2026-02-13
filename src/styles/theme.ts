import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
	initialColorMode: 'system',
	useSystemColorMode: false,
}

// Кастомные брейкпоинты, включая '2xl' для переключения таблица/карточки
const breakpoints = {
	sm: '30em',
	md: '48em',
	lg: '62em',
	xl: '80em',
	'2xl': '85.6875em', // 1371px
}

const theme = extendTheme({
	breakpoints,
	config,
	colors: {
		brand: {
			50: '#e6f0ff',
			100: '#cce1ff',
			200: '#99c2ff',
			300: '#66a3ff',
			400: '#3385ff',
			500: '#0066ff',
			600: '#0052cc',
			700: '#003d99',
			800: '#002966',
			900: '#001433',
		},
		custom: {
			bgLight: '#F1F1F1',
			bgDark: '#1C1C1C',
			border: 'rgba(0, 0, 0, 0.1)',
			tableBorder: '#D9E1EC',
			tableHeaderBg: '#F1F1F1',
			critical: '#B93C3C',
			high: '#B93C3C',
			medium: '#CC892A',
			low: '#2D60ED',
			white: '#FFFFFF',
		},
	},
})

export default theme
