import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Button,
	FormControl,
	FormLabel,
	Textarea,
	Checkbox,
	VStack,
	HStack,
	Input,
	Box,
	Text,
	SimpleGrid,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Icon,
	useToast,
	Wrap,
	WrapItem,
	Tag,
	TagLabel,
	TagCloseButton,
} from '@chakra-ui/react'
import { ChangeEvent, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
	LuImage,
	LuChevronDown,
	LuChevronsUp,
	LuChevronUp,
	LuDiamond,
} from 'react-icons/lu'
import { CreateRequestFormData, Priority, Request } from '@/types'
import { pharmacies, categories } from '@/data/mockData'
import { ChevronDownIcon } from '@chakra-ui/icons'

const priorityConfig = {
	critical: {
		icon: LuChevronsUp,
		label: 'Критический',
		desc: 'требует немедленного решения',
		color: 'custom.critical',
	},
	high: {
		icon: LuChevronUp,
		label: 'Высокий',
		desc: 'важная проблема',
		color: 'custom.high',
	},
	medium: {
		icon: LuDiamond,
		label: 'Средний',
		desc: 'влияет на эффективность, но не стопорит',
		color: 'custom.medium',
	},
	low: {
		icon: LuChevronDown,
		label: 'Низкий',
		desc: 'незначительная проблема',
		color: 'custom.low',
	},
}

interface CreateRequestModalProps {
	isOpen: boolean
	onClose: () => void
	onCreate: (newRequest: Request) => void
	currentUser: string
}

const generateRequestNumber = (): string => {
	// Список доступных префиксов
	const prefixes = ['КН', 'ПЛ', 'СА', 'КТ', 'ИТ', 'ЗЛ']

	// Выбираем случайный префикс из массива
	const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]

	// Генерируем случайное число от 0 до 9999
	// и дополняем его нулями слева до 4 знаков
	const randomNumber = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, '0')

	return `${randomPrefix}-${randomNumber}`
}

export default function CreateRequestModal({
	isOpen,
	onClose,
	onCreate,
	currentUser,
}: CreateRequestModalProps) {
	const toast = useToast()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		getValues,
		control,
		formState: { errors },
	} = useForm<CreateRequestFormData>({
		defaultValues: {
			priority: 'medium',
			isWarranty: false,
			files: [],
		},
	})

	const watchedPriority = watch('priority') as Priority
	const files = watch('files') || []

	// Валидация файлов: разрешённые типы и максимальный размер 5 МБ
	const validateFile = (file: File): boolean => {
		const allowedTypes = [
			'image/jpeg',
			'image/png',
			'image/gif',
			'application/pdf',
		]
		const maxSize = 5 * 1024 * 1024 // 5MB

		if (!allowedTypes.includes(file.type)) {
			toast({
				title: 'Недопустимый тип файла',
				description: 'Разрешены только изображения (JPEG, PNG, GIF) и PDF',
				status: 'error',
				duration: 3000,
			})
			return false
		}

		if (file.size > maxSize) {
			toast({
				title: 'Файл слишком большой',
				description: 'Максимальный размер файла — 5 МБ',
				status: 'error',
				duration: 3000,
			})
			return false
		}

		return true
	}

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const newFiles = Array.from(e.target.files).filter(validateFile)
			if (newFiles.length === 0) return

			const currentFiles = getValues('files') || []
			const updatedFiles = [...currentFiles, ...newFiles]
			setValue('files', updatedFiles, { shouldDirty: true })
			e.target.value = ''
		}
	}

	const removeFile = (index: number) => {
		const currentFiles = getValues('files') || []
		const updatedFiles = currentFiles.filter((_, i) => i !== index)
		setValue('files', updatedFiles, { shouldDirty: true })
	}

	const onSubmit = (data: CreateRequestFormData) => {
		console.log('Создана заявка:', data)

		const now = new Date()
		const createdAt = `${String(now.getDate()).padStart(2, '0')}.${String(
			now.getMonth() + 1,
		).padStart(2, '0')}.${now.getFullYear()}`
		const createdTime = `${String(now.getHours()).padStart(2, '0')}:${String(
			now.getMinutes(),
		).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
		const deadline = new Date(now.getTime() + 2 * 60 * 60 * 1000)
		const deadlineFormatted = `${String(deadline.getHours()).padStart(
			2,
			'0',
		)}:${String(deadline.getMinutes()).padStart(2, '0')}`

		const pharmacyObj = pharmacies.find(p => p.id === data.pharmacy) || {
			id: data.pharmacy,
			address: 'Неизвестный адрес',
		}

		const newRequest: Request = {
			id: Date.now().toString(),
			number: generateRequestNumber(),
			pharmacy: { id: pharmacyObj.id, address: pharmacyObj.address },
			createdAt,
			createdTime,
			priority: data.priority,
			title: data.title,
			category: data.category,
			technician: currentUser,
			deadline: deadlineFormatted,
			decision: '',
			status: 'new',
		}

		onCreate(newRequest)
		toast({ title: 'Заявка создана', status: 'success', duration: 3000 })
		onClose()
		reset()
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	const PriorityItem = ({ p }: { p: Priority }) => {
		const config = priorityConfig[p]
		return (
			<>
				<Icon
					as={config.icon}
					color={config.color}
					boxSize='18px'
					flexShrink={0}
					aria-hidden='true'
				/>
				<VStack align='start' spacing={0} overflow='hidden'>
					<Text
						color='#1C1C1C'
						fontFamily='Inter, sans-serif'
						fontSize='12px'
						fontWeight='400'
						lineHeight='normal'
					>
						{config.label}:
					</Text>
					<Text
						color='#B0B0B0'
						fontFamily='Inter, sans-serif'
						fontSize='11px'
						fontWeight='400'
						lineHeight='normal'
						isTruncated
					>
						{config.desc}
					</Text>
				</VStack>
			</>
		)
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} isCentered size='full'>
			<ModalOverlay bg='blackAlpha.400' />
			<ModalContent
				maxW={{ base: '100%', md: '1007px' }}
				minH={{ base: '100%', md: '741px' }}
				maxH={{ base: '741px', md: 'calc(100vh - 32px)' }}
				borderRadius={{ base: '0', md: '15px' }}
				boxShadow='2xl'
				m={{ base: '0', md: '4' }}
				display='flex'
				flexDirection='column'
			>
				<ModalHeader
					fontSize={{ base: '20px', md: '24px' }}
					fontWeight={{ base: '600', md: '500' }}
					pt={6}
					pl={{ base: 6, md: 10 }}
				>
					Создание заявки
				</ModalHeader>
				<ModalCloseButton top={6} right={6} size='md' />

				<ModalBody
					p={{ base: 4, md: 10 }}
					pt={{ base: 0, md: 0 }}
					flex='1'
					overflowY='auto'
				>
					<form
						onSubmit={handleSubmit(onSubmit)}
						style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
					>
						<SimpleGrid
							columns={{ base: 1, lg: 2 }}
							spacingX={{ base: 0, lg: '40px' }}
							spacingY={{ base: 4, md: 6 }}
						>
							{/* Левая колонка */}
							<VStack align='stretch' spacing={{ base: 3, md: 5 }}>
								<Controller
									control={control}
									name='pharmacy'
									rules={{ required: 'Выберите аптеку' }}
									render={({ field }) => (
										<FormControl isInvalid={!!errors.pharmacy}>
											<FormLabel
												color='#1C1C1C'
												fontFamily="'Inter', sans-serif"
												fontSize='12px'
												fontWeight='400'
												mb='6px'
												alignSelf='stretch'
											>
												Аптека
											</FormLabel>

											<Menu matchWidth>
												<MenuButton
													as={Button}
													w='100%'
													h={{ base: '42px', md: '48px' }} 
													bg='#FEFEFE'
													borderRadius='8px'
													border='1px solid'
													borderColor={errors.pharmacy ? 'red.500' : '#B0B0B0'}
													color={field.value ? '#1C1C1C' : '#B0B0B0'}
													fontSize='14px'
													fontWeight='400'
													fontFamily="'Inter', sans-serif"
													textAlign='left'
													px='16px'
													_hover={{ borderColor: '#B0B0B0' }}
													_active={{ bg: '#FEFEFE' }}
													_focus={{ boxShadow: 'none' }}
													rightIcon={
														<ChevronDownIcon
															color='#1C1C1C'
															w='15px'
															h='15px'
														/>
													}
												>
													{/* Находим выбранную аптеку, чтобы отобразить её адрес в кнопке */}
													<Box
														as='span'
														display='block'
														textAlign='left'
														overflow='hidden'
														textOverflow='ellipsis'
														whiteSpace='nowrap'
														paddingRight='20px' 
													>
														{field.value
															? pharmacies.find(p => p.id === field.value)
																	?.address
															: 'Выберите аптеку от которой исходит заявка'}
													</Box>
												</MenuButton>

												<MenuList
													minW='0' 
													zIndex={10}
													maxH='300px' 
													overflowY='auto'
													bg='#FEFEFE'
													borderRadius='8px'
													borderColor='#B0B0B0'
												>
													{pharmacies.map(p => (
														<MenuItem
															key={p.id}
															onClick={() => field.onChange(p.id)}
															fontSize='14px'
															color='#1C1C1C'
															py='10px'
															_hover={{ bg: 'gray.50' }}
															whiteSpace='normal' 
														>
															{p.id} - {p.address}
														</MenuItem>
													))}
												</MenuList>
											</Menu>

											{errors.pharmacy && (
												<Text color='red.500' fontSize='sm' mt={1}>
													{errors.pharmacy.message}
												</Text>
											)}
										</FormControl>
									)}
								/>

								<Controller
									control={control}
									name='category'
									rules={{ required: 'Выберите категорию' }}
									render={({ field }) => (
										<FormControl isInvalid={!!errors.category}>
											<FormLabel
												color='#1C1C1C'
												fontSize='12px'
												fontWeight='400'
												mb='6px'
											>
												Категория заявки
											</FormLabel>

											<Menu matchWidth>
												<MenuButton
													as={Button}
													{...field}
													w='100%'
													h={{ base: '42px', md: '40px' }}
													bg='#FEFEFE'
													borderRadius='8px'
													border='1px solid'
													borderColor={errors.category ? 'red.500' : '#B0B0B0'}
													fontWeight='400'
													fontSize='14px'
													color={field.value ? '#1C1C1C' : '#B0B0B0'}
													textAlign='left'
													px='16px'
													rightIcon={<ChevronDownIcon color='#1C1C1C' />}
													_hover={{ borderColor: '#B0B0B0' }}
													_active={{ bg: '#FEFEFE' }}
													
												>
													<Box
														as='span'
														display='block'
														textAlign='left'
														overflow='hidden'
														textOverflow='ellipsis'
														whiteSpace='nowrap'
														paddingRight='20px' 
													>
														{field.value ||
															'Холодильники, кондиционеры или другое'}
													</Box>
												</MenuButton>

												<MenuList minW='0' p={0} bg='#FEFEFE' shadow='md'>
													{categories.map(c => (
														<MenuItem
															key={c}
															onClick={() => field.onChange(c)}
															fontSize='14px'
															_hover={{ bg: 'gray.50' }}
															py='10px'
														>
															{c}
														</MenuItem>
													))}
												</MenuList>
											</Menu>

											{errors.category && (
												<Text color='red.500' fontSize='sm' mt={1}>
													{errors.category.message}
												</Text>
											)}
										</FormControl>
									)}
								/>

								{/* Контроллер для Checkbox */}
								<FormControl>
									<Controller
										name='isWarranty'
										control={control}
										render={({ field: { value, onChange } }) => (
											<Checkbox
												isChecked={value}
												onChange={e => onChange(e.target.checked)}
												display='flex'
												alignItems='center'
												alignSelf='stretch'
												gap='8px'
												spacing={0}
												iconColor='#1C1C1C'
												colorScheme='whiteAlpha'
												sx={{
													'.chakra-checkbox__control': {
														width: '20px',
														height: '20px',
														borderRadius: '5px',
														border: '1px solid #B0B0B0',
														bg: '#FEFEFE',
														_checked: {
															bg: '#FEFEFE',
															borderColor: '#B0B0B0',
															color: '#1C1C1C',
														},
														_hover: {
															bg: '#FEFEFE',
														},
													},
												}}
											>
												<Text
													color='#1C1C1C'
													fontFamily="'Inter', sans-serif"
													fontSize='14px'
													fontStyle='normal'
													fontWeight='400'
													lineHeight='normal'
													ml='8px'
												>
													Гарантийный случай?
												</Text>
											</Checkbox>
										)}
									/>
								</FormControl>
							</VStack>

							{/* Правая колонка */}
							<VStack align='stretch' spacing={{ base: 3, md: 5 }}>
								<FormControl isInvalid={!!errors.title}>
									<FormLabel
										alignSelf='stretch'
										color='#1C1C1C'
										fontFamily="'Inter', sans-serif"
										fontSize='12px'
										fontWeight='400'
										fontStyle='normal'
										lineHeight='normal'
										mb={1.5}
									>
										Тема заявки
									</FormLabel>
									<Textarea
										{...register('title', { required: 'Введите тему заявки' })}
										placeholder='Дайте заявке краткое название: например, сломался холодильник или не работает кондиционер'
										h='70px'
										minH='70px'
										display='flex'
										p='13px 16px'
										alignItems='flex-start'
										alignSelf='stretch'
										borderRadius='6px'
										border='1px solid'
										borderColor='#B0B0B0'
										bg='#FEFEFE'
										color='black'
										fontFamily='Inter, sans-serif'
										fontSize='12px'
										fontWeight='400'
										lineHeight='1.4'
										resize='none'
										_placeholder={{
											color: '#B0B0B0',
											fontSize: '12px',
											fontWeight: '400',
											lineHeight: 'normal',
										}}
										_focus={{
											borderColor: '#B0B0B0',
											boxShadow: 'none',
										}}
									/>
									{errors.title && (
										<Text color='red.500' fontSize='sm' mt={1}>
											{errors.title.message}
										</Text>
									)}
								</FormControl>

								<FormControl>
									<FormLabel
										alignSelf='stretch'
										color='#1C1C1C'
										fontFamily="'Inter', sans-serif"
										fontSize='12px'
										fontWeight='400'
										fontStyle='normal'
										lineHeight='normal'
										mb={1.5}
										marginInlineEnd={0}
									>
										Приоритет
									</FormLabel>
									<Menu matchWidth>
										<MenuButton
											as={Button}
											display='flex'
											w='full'
											h={{ base: '46px', md: '40px' }}
											p='8px 16px'
											alignItems='center'
											alignSelf='stretch'
											borderRadius='6px'
											border='1px solid #B0B0B0'
											bg='#FEFEFE'
											variant='outline'
											rightIcon={<Icon as={LuChevronDown} color='#1C1C1C' />}
											_hover={{ bg: '#FEFEFE', borderColor: '#B0B0B0' }}
											_active={{ bg: '#FEFEFE' }}
											textAlign='left'
										>
											<Box
												display='flex'
												alignItems='center'
												gap='8px'
												flex='1 0 0'
											>
												<PriorityItem p={watchedPriority} />
											</Box>
										</MenuButton>
										<MenuList borderRadius='10px' shadow='lg'>
											{(Object.keys(priorityConfig) as Priority[]).map(p => (
												<MenuItem
													key={p}
													onClick={() => setValue('priority', p)}
													py={{ base: 2, md: 3 }}
												>
													<PriorityItem p={p} />
												</MenuItem>
											))}
										</MenuList>
									</Menu>
								</FormControl>

								<FormControl>
									<FormLabel
										alignSelf='stretch'
										color='#1C1C1C'
										fontFamily="'Inter', sans-serif"
										fontSize='12px'
										fontWeight='400'
										lineHeight='normal'
										mb={1.5}
									>
										Описание проблемы
									</FormLabel>
									<Textarea
										{...register('description')}
										placeholder={
											'Кратко опишите проблему:\n\nчто случилось?\nдата и время произошедшего?\nсколько длится проблема?\nнасколько она влияет на вашу работу?'
										}
										h='164px'
										display='flex'
										p='13px 16px'
										alignItems='flex-start'
										gap='10px'
										alignSelf='stretch'
										borderRadius='6px'
										border='1px solid #B0B0B0'
										bg='#FEFEFE'
										color='black'
										fontFamily="'Inter', sans-serif"
										fontSize='12px'
										fontWeight='400'
										lineHeight='normal'
										resize='none'
										_placeholder={{
											color: '#B0B0B0',
											fontFamily: "'Inter', sans-serif",
											fontSize: '12px',
											fontStyle: 'normal',
											fontWeight: '400',
											lineHeight: 'normal',
										}}
										_focus={{
											borderColor: '#B0B0B0',
											boxShadow: 'none',
										}}
										mb={{ base: 10, md: 0 }}
									/>
								</FormControl>

								<FormControl alignSelf='stretch'>
									<FormLabel
										mr={0}
										onClick={e => {
											if (window.innerWidth < 768) {
												e.preventDefault() 
												fileInputRef.current?.click()
											}
										}}
										display={{ base: 'flex', md: 'block' }}
										h={{ base: '50px', md: 'auto' }}
										bg={{ base: '#F1F1F1', md: 'transparent' }}
										p={{ base: '8px 20px', md: '0' }}
										borderRadius={{ base: '4px', md: '0' }}
										border={{ base: 'none', md: 'none' }}
										justifyContent='center'
										alignItems='center'
										gap='12px'
										cursor='pointer'
										color='#1C1C1C'
										fontFamily="'Inter', sans-serif"
										fontSize={{ base: '16px', md: '12px' }}
										fontWeight={{ base: '500', md: '400' }}
										lineHeight={{ base: '24px', md: 'normal' }}
										mb={{ base: 0, md: '6px' }}
										_hover={{ base: { bg: '#E8E8E8' }, md: {} }}
									>
										<Box
											as='span'
											display={{ base: 'flex', md: 'none' }}
											w='24px'
											h='24px'
											alignItems='center'
											justifyContent='center'
											flexShrink={0}
										>
											<svg
												width='24'
												height='24'
												viewBox='0 0 24 24'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													d='M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z'
													fill='#1C1B1F'
												/>
											</svg>
										</Box>
										Прикрепите файлы
									</FormLabel>

									<Box
										display={{ base: 'none', md: 'flex' }}
										h='100px'
										padding='8px 16px'
										alignItems='center'
										justifyContent='center'
										gap='10px'
										alignSelf='stretch'
										borderRadius='14px'
										border='1px dashed #B0B0B0'
										bg='#FEFEFE'
										cursor='pointer'
										_hover={{ bg: '#F9F9F9' }}
										onClick={() => fileInputRef.current?.click()}
									>
										<Input
											ref={fileInputRef}
											type='file'
											multiple
											hidden
											onChange={handleFileChange}
											accept='image/jpeg,image/png,image/gif,application/pdf'
										/>

										<VStack spacing='10px'>
											<Text
												color='#1C1C1C'
												fontFamily="'Inter', sans-serif"
												fontSize='14px'
												fontWeight='300'
												fontStyle='normal'
												lineHeight='normal'
											>
												Выберите или перетащите фото или файл
											</Text>
											<LuImage
												size={24}
												style={{
													strokeWidth: '1.5px',
													stroke: '#1C1C1C',
												}}
											/>
										</VStack>
									</Box>

									{files.length > 0 && (
										<Wrap mt={3} spacing={2}>
											{files.map((file, idx) => (
												<WrapItem key={idx}>
													<Tag
														size='md'
														borderRadius='full'
														variant='subtle'
														bg='#E2E8F0'
														color='#1C1C1C'
													>
														<TagLabel fontSize='12px'>{file.name}</TagLabel>
														<TagCloseButton
															onClick={e => {
																e.stopPropagation()
																removeFile(idx)
															}}
														/>
													</Tag>
												</WrapItem>
											))}
										</Wrap>
									)}
								</FormControl>
							</VStack>
						</SimpleGrid>

						{/* Кнопки */}
						<HStack
							mt={{ base: 0, md: 4 }}
							pt={4}
							spacing={{ base: 2, md: 4 }}
							flexShrink={0}
						>
							<Button
								type='submit'
								w={{ base: '100%', md: 'auto' }}
								h={{ base: '50px', md: '40px' }}
								px={{ base: '20px', md: '17px' }}
								py='8px'
								borderRadius='5px'
								bg='#1A1A1A'
								color='white'
								fontSize={{ base: '14px', md: '16px' }}
								_hover={{ bg: '#333' }}
								_active={{
									opacity: 1,
								}}
							>
								Создать заявку
							</Button>
							<Button
								variant='outline'
								h={{ base: '40px', md: '40px' }}
								px='10px'
								borderRadius='5px'
								borderColor='gray.300'
								fontSize={{ base: '14px', md: '16px' }}
								display={{ base: 'none', md: 'flex' }}
								onClick={onClose}
							>
								Отмена
							</Button>
						</HStack>
					</form>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}
