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
	Select,
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
import { useState, ChangeEvent, useRef } from 'react'
import { useForm } from 'react-hook-form'
import {
	LuImage,
	LuChevronDown,
	LuChevronsUp,
	LuChevronUp,
	LuDiamond,
} from 'react-icons/lu'
import { CreateRequestFormData, Priority, Request } from '@/types'
import { pharmacies, categories } from '@/data/mockData'

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
	const prefix = 'ЗЯ'
	const random = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, '0')
	return `${prefix}-${random}`
}

export default function CreateRequestModal({
	isOpen,
	onClose,
	onCreate,
	currentUser,
}: CreateRequestModalProps) {
	const toast = useToast()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const { register, handleSubmit, setValue, watch, reset } =
		useForm<CreateRequestFormData>({
			defaultValues: {
				priority: 'medium',
				isWarranty: false,
				files: [], // единый источник истины
			},
		})

	const watchedPriority = watch('priority') as Priority
	const files = watch('files') || []

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const newFiles = Array.from(e.target.files)
			const currentFiles = watch('files') || []
			const updatedFiles = [...currentFiles, ...newFiles]
			setValue('files', updatedFiles, { shouldDirty: true })
			// Сброс input, чтобы можно было выбрать тот же файл повторно
			e.target.value = ''
		}
	}

	const removeFile = (index: number) => {
		const currentFiles = watch('files') || []
		const updatedFiles = currentFiles.filter((_, i) => i !== index)
		setValue('files', updatedFiles, { shouldDirty: true })
	}

	const onSubmit = (data: CreateRequestFormData) => {
		// Вывод в консоль по ТЗ
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
			<HStack spacing={2}>
				<Icon as={config.icon} color={config.color} boxSize='18px' />
				<Text
					fontWeight='600'
					fontSize={{ base: '14px', md: '15px' }}
					color='gray.800'
				>
					{config.label}:
				</Text>
				<Text
					fontSize={{ base: '12px', md: '14px' }}
					color='gray.400'
					isTruncated
				>
					{config.desc}
				</Text>
			</HStack>
		)
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} isCentered size='full'>
			<ModalOverlay bg='blackAlpha.400' />
			<ModalContent
				maxW={{ base: '95%', md: '1007px' }}
				minH='741px'
				borderRadius='15px'
				boxShadow='2xl'
				m={4}
				display='flex'
				flexDirection='column'
			>
				<ModalHeader
					fontSize={{ base: '22px', md: '28px' }}
					fontWeight='600'
					pt={6}
					pl={{ base: 6, md: 10 }}
				>
					Создание заявки
				</ModalHeader>
				<ModalCloseButton top={6} right={6} size='md' />

				<ModalBody p={{ base: 4, md: 10 }} flex='1' overflowY='auto'>
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
								<FormControl isRequired>
									<FormLabel
										color='gray.700'
										fontSize={{ base: '12px', md: '14px' }}
										mb={1.5}
									>
										Аптека
									</FormLabel>
									<Select
										{...register('pharmacy', { required: true })}
										h={{ base: '40px', md: '48px' }}
										placeholder='Выберите аптеку от которой исходит заявка'
										borderRadius='10px'
										fontSize={{ base: '13px', md: '15px' }}
										color='gray.500'
									>
										{pharmacies.map(p => (
											<option key={p.id} value={p.id}>
												{p.id} - {p.address}
											</option>
										))}
									</Select>
								</FormControl>

								<FormControl isRequired>
									<FormLabel
										color='gray.700'
										fontSize={{ base: '12px', md: '14px' }}
										mb={1.5}
									>
										Категория заявки
									</FormLabel>
									<Select
										{...register('category', { required: true })}
										h={{ base: '40px', md: '48px' }}
										placeholder='Холодильники, кондиционеры или другое'
										borderRadius='10px'
										fontSize={{ base: '13px', md: '15px' }}
										color='gray.500'
									>
										{categories.map(c => (
											<option key={c} value={c}>
												{c}
											</option>
										))}
									</Select>
								</FormControl>

								<Checkbox
									{...register('isWarranty')}
									colorScheme='gray'
									size='md'
									mt={1}
								>
									<Text
										fontSize={{ base: '14px', md: '16px' }}
										fontWeight='400'
										ml={1}
									>
										Гарантийный случай?
									</Text>
								</Checkbox>
							</VStack>

							{/* Правая колонка */}
							<VStack align='stretch' spacing={{ base: 3, md: 5 }}>
								<FormControl isRequired>
									<FormLabel
										color='gray.700'
										fontSize={{ base: '12px', md: '14px' }}
										mb={1.5}
									>
										Тема заявки
									</FormLabel>
									<Input
										{...register('title', { required: true })}
										placeholder='Краткое название заявки'
										h={{ base: '40px', md: '48px' }}
										borderRadius='10px'
										fontSize={{ base: '13px', md: '15px' }}
									/>
								</FormControl>

								<FormControl>
									<FormLabel
										color='gray.700'
										fontSize={{ base: '12px', md: '14px' }}
										mb={1.5}
									>
										Приоритет
									</FormLabel>
									<Menu matchWidth>
										<MenuButton
											as={Button}
											variant='outline'
											w='full'
											h={{ base: '40px', md: '48px' }}
											borderRadius='10px'
											textAlign='left'
											rightIcon={<LuChevronDown />}
											_active={{ bg: 'white' }}
											px={{ base: 2, md: 4 }}
											fontSize={{ base: '13px', md: '15px' }}
										>
											<PriorityItem p={watchedPriority} />
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
										color='gray.700'
										fontSize={{ base: '12px', md: '14px' }}
										mb={1.5}
									>
										Описание проблемы
									</FormLabel>
									<Textarea
										{...register('description')}
										placeholder='Кратко опишите проблему:&#10;• что случилось?&#10;• дата и время?'
										h={{ base: '80px', md: '120px' }}
										borderRadius='10px'
										fontSize={{ base: '13px', md: '15px' }}
										resize='none'
									/>
								</FormControl>

								<FormControl>
									<FormLabel
										color='gray.700'
										fontSize={{ base: '12px', md: '14px' }}
										mb={1.5}
									>
										Прикрепите файлы
									</FormLabel>
									<Box
										border='1px dashed'
										borderColor='gray.300'
										borderRadius='12px'
										h={{ base: '70px', md: '90px' }}
										display='flex'
										alignItems='center'
										justifyContent='center'
										cursor='pointer'
										_hover={{ bg: 'gray.50' }}
										onClick={() => fileInputRef.current?.click()}
									>
										<Input
											ref={fileInputRef}
											id='file-input'
											type='file'
											multiple
											hidden
											onChange={handleFileChange}
										/>
										<VStack spacing={1}>
											<Text
												color='gray.600'
												fontSize={{ base: '12px', md: '14px' }}
											>
												Выберите фото или файл
											</Text>
											<LuImage size={20} color='#A0AEC0' />
										</VStack>
									</Box>
									{/* Отображение загруженных файлов */}
									{files.length > 0 && (
										<Wrap mt={3} spacing={2}>
											{files.map((file, idx) => (
												<WrapItem key={idx}>
													<Tag
														size='md'
														borderRadius='full'
														variant='subtle'
														colorScheme='gray'
													>
														<TagLabel>{file.name}</TagLabel>
														<TagCloseButton onClick={() => removeFile(idx)} />
													</Tag>
												</WrapItem>
											))}
										</Wrap>
									)}
								</FormControl>
							</VStack>
						</SimpleGrid>

						{/* Кнопки */}
						<HStack mt={4} pt={4} spacing={{ base: 2, md: 4 }} flexShrink={0}>
							<Button
								type='submit'
								bg='#1A1A1A'
								color='white'
								h={{ base: '40px', md: '50px' }}
								px={{ base: '20px', md: '44px' }}
								borderRadius='10px'
								_hover={{ bg: '#333' }}
								fontSize={{ base: '14px', md: '16px' }}
							>
								Создать заявку
							</Button>
							<Button
								variant='outline'
								h={{ base: '40px', md: '50px' }}
								px={{ base: '20px', md: '44px' }}
								borderRadius='10px'
								borderColor='gray.300'
								fontSize={{ base: '14px', md: '16px' }}
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
