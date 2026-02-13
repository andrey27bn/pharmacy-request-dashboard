import React, { useState, useMemo } from 'react'
import {
	Box,
	Container,
	Flex,
	HStack,
	VStack,
	Button,
	Input,
	InputGroup,
	InputLeftElement,
	Text,
	Avatar,
	Badge,
	useDisclosure,
	useBreakpointValue,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Heading,
	Divider,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { LuLogOut, LuFilter } from 'react-icons/lu'
import { Request, Status, Priority } from '@/types'
import { mockRequests } from '@/data/mockData'
import RequestsTable from './components/RequestsTable'
import RequestGridCard from './components/RequestGridCard'
import CreateRequestModal from './components/CreateRequestModal'
import imgEllipse128 from '../assets/author.png'
import { MdOutlinePictureAsPdf } from 'react-icons/md'

type TabValue = 'all' | Status

const CURRENT_USER = 'Иванов И.'

const formatDate = (date: Date): string => {
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()
	return `${day}.${month}.${year}`
}

// Приоритеты в логическом порядке (critical → low)
const priorityRank: Record<Priority, number> = {
	critical: 0,
	high: 1,
	medium: 2,
	low: 3,
}

// Статусы в логическом порядке (new → closed)
const statusRank: Record<Status, number> = {
	new: 0,
	declined: 1,
	under_review: 2,
	in_progress: 3,
	awaiting_parts: 4,
	ready: 5,
	closed: 6,
}

export default function App() {
	const { isOpen, onOpen, onClose } = useDisclosure()
	const [requests, setRequests] = useState<Request[]>(mockRequests)
	const [searchQuery, setSearchQuery] = useState('')
	const [activeTab, setActiveTab] = useState<TabValue>('all')
	const [sortField, setSortField] = useState<string>('')
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
	const [showMyRequests, setShowMyRequests] = useState(false)

	const isMobile = useBreakpointValue({ base: true, md: false })

	// Фильтрация и сортировка
	const filteredRequests = useMemo(() => {
		let filtered = requests

		if (activeTab !== 'all') {
			filtered = filtered.filter(req => req.status === activeTab)
		}
		if (showMyRequests) {
			filtered = filtered.filter(req => req.technician === CURRENT_USER)
		}
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter(
				req =>
					req.number.toLowerCase().includes(query) ||
					req.title.toLowerCase().includes(query) ||
					req.pharmacy.address.toLowerCase().includes(query) ||
					req.category.toLowerCase().includes(query),
			)
		}
		if (sortField) {
			filtered = [...filtered].sort((a, b) => {
				let aVal: any = a[sortField as keyof Request]
				let bVal: any = b[sortField as keyof Request]

				if (sortField === 'pharmacy') {
					aVal = a.pharmacy.address
					bVal = b.pharmacy.address
				}

				// Кастомная сортировка для приоритета
				if (sortField === 'priority') {
					const order = sortDirection === 'asc' ? 1 : -1
					return (priorityRank[a.priority] - priorityRank[b.priority]) * order
				}

				// Кастомная сортировка для статуса
				if (sortField === 'status') {
					const order = sortDirection === 'asc' ? 1 : -1
					return (statusRank[a.status] - statusRank[b.status]) * order
				}

				// Обычная сортировка для остальных полей
				if (typeof aVal === 'string') {
					return sortDirection === 'asc'
						? aVal.localeCompare(bVal)
						: bVal.localeCompare(aVal)
				}
				if (typeof aVal === 'number' || aVal instanceof Date) {
					return sortDirection === 'asc'
						? aVal > bVal
							? 1
							: -1
						: aVal < bVal
							? 1
							: -1
				}
				return 0
			})
		}
		return filtered
	}, [
		requests,
		activeTab,
		showMyRequests,
		searchQuery,
		sortField,
		sortDirection,
	])

	const handleCreateRequest = (newRequest: Request) => {
		setRequests(prev => [newRequest, ...prev])
	}

	const handleSort = (field: string) => {
		if (sortField === field) {
			setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
		} else {
			setSortField(field)
			setSortDirection('asc')
		}
	}

	// Группировка по датам только для мобильной версии
	const groupedRequests = useMemo(() => {
		const groups: Record<string, Request[]> = {}
		const today = formatDate(new Date())
		const yesterday = formatDate(new Date(Date.now() - 86400000))

		filteredRequests.forEach(req => {
			const date = req.createdAt
			let groupKey = date
			if (date === today) groupKey = 'СЕГОДНЯ'
			else if (date === yesterday) groupKey = 'ВЧЕРА'
			if (!groups[groupKey]) groups[groupKey] = []
			groups[groupKey].push(req)
		})

		const sortedKeys = Object.keys(groups).sort((a, b) => {
			if (a === 'СЕГОДНЯ') return -1
			if (b === 'СЕГОДНЯ') return 1
			if (a === 'ВЧЕРА') return -1
			if (b === 'ВЧЕРА') return 1
			const parseDate = (d: string) => {
				const [day, month, year] = d.split('.')
				return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
			}
			return parseDate(b) - parseDate(a)
		})
		return { groups, sortedKeys }
	}, [filteredRequests])

	const statusTabs: { value: TabValue; label: string }[] = [
		{ value: 'new', label: 'Новые' },
		{ value: 'declined', label: 'Отклонены' },
		{ value: 'under_review', label: 'На рассмотрении' },
		{ value: 'in_progress', label: 'В работе' },
		{ value: 'awaiting_parts', label: 'Ожидают запчасти' },
		{ value: 'ready', label: 'Готовы' },
		{ value: 'closed', label: 'Закрыты' },
		{ value: 'all', label: 'Все статусы' },
	]

	const visibleTabs = useMemo(() => {
		if (!isMobile) return statusTabs
		const allTab = statusTabs.find(tab => tab.value === 'all')
		const rest = statusTabs.filter(tab => tab.value !== 'all')
		return allTab ? [allTab, ...rest] : statusTabs
	}, [isMobile])

	return (
		<Box minH='100vh'>
			{/* Хедер */}
			<Box
				bg='white'
				borderBottom='1px solid'
				borderColor='custom.border'
				position='sticky'
				top={0}
				zIndex={10}
				boxShadow='sm'
			>
				<Container maxW='1920px' px={{ base: 4, md: 8 }}>
					<Flex h='86px' align='center' justify='space-between'>
						<HStack
							gap={6}
							display={{ base: 'none', md: 'flex' }}
							ml='clamp(0px, calc(6.42vw - 25.23px), 98px)'
						>
							<HStack gap={4}>
								<Text
									fontWeight='medium'
									cursor='pointer'
									_hover={{ color: 'gray.600' }}
								>
									Заявки
								</Text>
								<Text
									color='#B0B0B0'
									cursor='pointer'
									_hover={{ color: 'gray.700' }}
								>
									Отчеты
								</Text>
							</HStack>
							<Menu>
								<MenuButton
									as={Button}
									variant='ghost'
									rightIcon={<ChevronDownIcon />}
									color='#B0B0B0'
								>
									Справочники
								</MenuButton>
								<MenuList>
									<MenuItem>Аптеки</MenuItem>
									<MenuItem>Техники</MenuItem>
									<MenuItem>Категории</MenuItem>
								</MenuList>
							</Menu>
						</HStack>

						<Menu>
							<MenuButton
								as={Button}
								variant='unstyled'
								display={{ base: 'flex', md: 'none' }}
								alignItems='center'
								gap='2px'
								height='auto'
								minW='auto'
								// Стили текста
								color='#1C1C1C'
								fontFamily='Inter, sans-serif'
								fontSize='20px'
								fontWeight='600'
								lineHeight='24px'
								letterSpacing='-0.2px'
								// Состояния
								_hover={{ color: 'gray.600' }}
								_active={{ bg: 'transparent' }}
								// Иконка
								rightIcon={
									<ChevronDownIcon
										w='24px'
										h='24px'
									/>
								}
							>
								Заявки
							</MenuButton>
							<MenuList>
								<MenuItem>Отчеты</MenuItem>
								<MenuItem>Справочники</MenuItem>
								<MenuItem>Выйти</MenuItem>
							</MenuList>
						</Menu>

						<HStack gap={6}>
							<Box position='relative' display={{ base: 'none', md: 'block' }}>
								<Avatar size='sm' src={imgEllipse128} />
								<Badge
									position='absolute'
									bottom='-5px'
									right='-6px'
									bg='custom.critical'
									color='custom.bgLight'
									borderRadius='full'
									boxSize='18px'
									display='flex'
									alignItems='center'
									justifyContent='center'
									fontSize='10px'
									fontWeight='600'
									p='0'
								>
									2
								</Badge>
							</Box>
							<Button
								leftIcon={<LuLogOut size={20} />}
								variant='outline'
								color='gray.800'
								borderColor='gray.300'
								_hover={{ bg: 'gray.50' }}
								bg='custom.bgLight'
								display={{ base: 'none', md: 'flex' }}
							>
								Выйти
							</Button>
							<Box position='relative' display={{ base: 'block', md: 'none' }}>
								<Avatar size='sm' src={imgEllipse128} />
								<Badge
									position='absolute'
									top='-4px'
									right='-4px'
									colorScheme='red'
									borderRadius='full'
									fontSize='xs'
									px={1.5}
								>
									2
								</Badge>
							</Box>
						</HStack>
					</Flex>
				</Container>
			</Box>

			{/* Основной контент */}
			<Container maxW='1920px' px={{ base: 4, md: 10 }} py={{ base: 4, md: 5 }}>
				<VStack gap={6} align='stretch'>
					{/* Строка поиска и действий */}
					<Flex
						direction={{ base: 'column', md: 'row' }}
						gap={3}
						align={{ base: 'stretch', md: 'center' }}
						justify='space-between'
						display={{ base: 'none', md: 'flex' }}
					>
						<InputGroup maxW={{ base: 'full', md: '1472px' }} flex={1}>
							<InputLeftElement pointerEvents='none'>
								<SearchIcon
									color='gray.400'
									display={{ base: 'none', md: 'flex' }}
								/>
							</InputLeftElement>
							<Input
								placeholder='Поиск по номеру или теме заявки'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								bg='white'
								_hover={{ borderColor: 'gray.300' }}
							/>
						</InputGroup>

						<HStack gap={2}>
							<Button
								variant='outline'
								leftIcon={<MdOutlinePictureAsPdf size={17} color='#1C1C1C' />}
								w='112px'
								h='40px'
								bg='custom.bgLight'
								borderColor='gray.200'
								// Стили текста
								color='#1C1C1C'
								fontFamily='Inter, sans-serif'
								fontSize='16px'
								fontWeight='400'
								lineHeight='24px'
								textAlign='center'
								_hover={{ bg: 'gray.100' }}
							>
								Экспорт
							</Button>
							<Button
								onClick={onOpen}
								// Размеры и позиционирование
								w={{ base: 'full', md: '230px' }}
								h='40px'
								display='flex'
								padding='8px 17px'
								justifyContent='center'
								alignItems='center'
								gap='10px'
								// Фон и границы
								bg='#1C1C1C'
								borderRadius='4px'
								_hover={{ bg: 'gray.700' }}
								// Стили текста
								color='#F1F1F1'
								fontFamily='Inter, sans-serif'
								fontSize='16px'
								fontWeight='400'
								lineHeight='24px'
								textAlign='center'
								// Иконка
								leftIcon={
									<AddIcon w='14px' h='14px' flexShrink={0} color='#F1F1F1' />
								}
							>
								Создать новую заявку
							</Button>
						</HStack>
					</Flex>

					{/* Табы и фильтр "Только мои" */}
					<Box
						width='100%'
						borderBottom='1px solid'
						borderColor='custom.tableBorder'
						pb={5}
					>
						<Flex align='center' gap={{ base: 2, xl: 6 }}>
							<Button
								display={{ base: 'flex', xl: 'none' }}
								onClick={() => setShowMyRequests(prev => !prev)}
								leftIcon={<LuFilter size={16} />}
								variant='solid'
								bg={showMyRequests ? 'custom.bgDark' : 'custom.bgLight'}
								color={showMyRequests ? 'white' : 'custom.bgDark'}
								size='sm'
								height={10}
								width={10}
								minW={10}
								p={0}
								borderRadius='4px'
								flexShrink={0}
								sx={{ '& .chakra-button__icon': { m: 0 } }}
							/>

							<HStack
								gap={2}
								overflowX='auto'
								py={1}
								css={{
									'&::-webkit-scrollbar': { display: 'none' },
									msOverflowStyle: 'none',
									scrollbarWidth: 'none',
								}}
							>
								{visibleTabs.map(tab => {
									const isActive = activeTab === tab.value
									return (
										<Button
											key={tab.value}
											onClick={() => setActiveTab(tab.value)}
											size='sm'
											variant='solid'
											fontWeight='normal'
											borderRadius='4px'
											bg={isActive ? 'custom.bgDark' : 'custom.bgLight'}
											color={isActive ? 'white' : 'custom.bgDark'}
											px={4}
											height={10}
											flexShrink={0}
											_hover={{
												bg: isActive ? 'black' : 'gray.200',
											}}
										>
											{tab.label}
										</Button>
									)
								})}
							</HStack>

							<Divider
								orientation='vertical'
								height='40px'
								borderWidth='2px'
								borderColor='gray.300'
								display={{ base: 'none', xl: 'block' }}
							/>

							<Button
								display={{ base: 'none', xl: 'flex' }}
								onClick={() => setShowMyRequests(prev => !prev)}
								leftIcon={<LuFilter size={12} />}
								variant='solid'
								bg={showMyRequests ? 'custom.bgDark' : 'custom.bgLight'}
								color={showMyRequests ? 'white' : 'custom.bgDark'}
								size='sm'
								fontWeight='normal'
								borderRadius='4px'
								px={4}
								height={10}
								flexShrink={0}
							>
								Показать только мои
							</Button>
						</Flex>
					</Box>

					{/* Контент: на десктопе таблица, на мобиле группированные карточки */}
					{!isMobile ? (
						<RequestsTable
							requests={filteredRequests}
							onSort={handleSort}
							sortField={sortField}
							sortDirection={sortDirection}
						/>
					) : (
						<VStack align='stretch' gap={6}>
							{groupedRequests.sortedKeys.map(dateGroup => (
								<Box key={dateGroup}>
									<Heading
										size='xs'
										color='gray.500'
										mb={3}
										textTransform='uppercase'
										letterSpacing='wide'
									>
										{dateGroup}
									</Heading>
									<VStack gap={3} align='stretch'>
										{groupedRequests.groups[dateGroup].map(request => (
											<RequestGridCard key={request.id} request={request} />
										))}
									</VStack>
								</Box>
							))}
							{filteredRequests.length === 0 && (
								<Box textAlign='center' py={10}>
									<Text color='gray.500' fontSize='lg'>
										Заявок не найдено
									</Text>
									<Text color='gray.400' fontSize='sm' mt={2}>
										Попробуйте изменить фильтры
									</Text>
								</Box>
							)}
						</VStack>
					)}
				</VStack>
			</Container>

			{/* Мобильная FAB-кнопка */}
			{isMobile && (
				<Box position='fixed' bottom={6} right={4} zIndex={10}>
					<VStack spacing={2} align='end'>
						<InputGroup maxW={{ base: '104px' }} flex={1}>
							<InputLeftElement pointerEvents='none' height='full' width='43px'>
								<SearchIcon color='#1C1C1C' boxSize='24px' />
							</InputLeftElement>

							<Input
								placeholder='Поиск'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								bg='#FFF'
								border='2px solid #1C1C1C'
								borderRadius='4px'
								color='#1C1C1C'
								fontFamily="'Inter', sans-serif"
								fontSize='16px'
								fontWeight='500'
								lineHeight='24px'
								h='40px'
								py='8px'
								px='12px'
								pl='43px'
								_placeholder={{
									color: '#1C1C1C',
									opacity: 1,
									fontWeight: '500',
								}}
								_hover={{ borderColor: '#1C1C1C' }}
								_focus={{
									borderColor: '#1C1C1C',
									boxShadow: 'none',
								}}
							/>
						</InputGroup>
						<Button
							// Иконка и её стили
							leftIcon={<AddIcon boxSize='14px' color='#FFF' />}
							onClick={onOpen}
							gap='7px'
							// Размеры и отступы
							py='8px'
							px='12px'
							h='auto'
							borderRadius='4px'
							// Цвета
							bg='#1C1C1C'
							color='#F1F1F1'
							// Типографика
							fontSize='16px'
							fontWeight='400'
							lineHeight='24px'
							transition='all 0.2s'
							_hover={{
								bg: '#2d2d2d',
								transform: 'scale(1.02)',
							}}
							_active={{ bg: '#000' }}
						>
							Создать новую заявку
						</Button>
					</VStack>
				</Box>
			)}

			{/* Модальное окно создания заявки */}
			<CreateRequestModal
				isOpen={isOpen}
				onClose={onClose}
				onCreate={handleCreateRequest}
				currentUser={CURRENT_USER}
			/>
		</Box>
	)
}
