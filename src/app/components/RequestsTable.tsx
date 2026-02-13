import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Badge,
	Box,
	Text,
	Flex,
	HStack,
	Icon,
	SimpleGrid,
	useMediaQuery,
} from '@chakra-ui/react'
import { Request } from '@/types'
import { statusLabels, statusBgColors } from '@/data/mockData'
import { ChevronUpIcon, ChevronDownIcon, TimeIcon } from '@chakra-ui/icons'
import PriorityIndicator from './PriorityIndicator'
import RequestGridCard from './RequestGridCard'
import { LuFilter } from 'react-icons/lu'

interface RequestsTableProps {
	requests: Request[]
	onSort?: (field: string) => void
	sortField?: string
	sortDirection?: 'asc' | 'desc'
}

// Маппинг заголовков на поля сортировки
const sortableFields: Record<string, string> = {
	'№': 'number',
	Аптека: 'pharmacy',
	Создана: 'createdAt',
	Приоритет: 'priority',
	Тема: 'title',
	Категория: 'category',
	Техник: 'technician',
	Дедлайн: 'deadline',
	Решение: 'decision',
	Статус: 'status',
}

export default function RequestsTable({
	requests,
	onSort,
	sortField,
	sortDirection,
}: RequestsTableProps) {
	const [isTableVisible] = useMediaQuery('(min-width: 1371px)')
	const [isMobile] = useMediaQuery('(max-width: 767px)')

	const SortIcon = ({ field }: { field: string }) => {
		if (sortField !== sortableFields[field]) return null
		return sortDirection === 'asc' ? (
			<ChevronUpIcon ml={1} />
		) : (
			<ChevronDownIcon ml={1} />
		)
	}

	// Пустое состояние
	if (requests.length === 0) {
		return (
			<Box
				p={10}
				textAlign='center'
				bg='white'
				borderRadius='8px'
				border='1px solid'
				borderColor='gray.200'
			>
				<Text color='gray.500' fontSize='lg'>
					Заявок не найдено
				</Text>
				<Text color='gray.400' fontSize='sm' mt={2}>
					Попробуйте изменить фильтры
				</Text>
			</Box>
		)
	}

	// Режим сетки (карточки) для экранов < 1371px
	if (!isTableVisible) {
		return (
			<SimpleGrid columns={isMobile ? 1 : 2} spacing={4}>
				{requests.map(request => (
					<RequestGridCard key={request.id} request={request} />
				))}
			</SimpleGrid>
		)
	}

	// Режим таблицы для широких экранов
	return (
		<Box
			overflow='hidden'
			bg='white'
			borderRadius='8px'
			border='1px solid'
			borderColor='gray.200'
		>
			<Box overflowX='auto'>
				<Table variant='simple' size='sm'>
					<Thead>
						<Tr bg='#F1F1F1' h='40px'>
							{Object.keys(sortableFields).map(title => (
								<Th
									key={title}
									px={3}
									cursor={onSort ? 'pointer' : 'default'}
									onClick={() => onSort?.(sortableFields[title])}
									userSelect='none'
								>
									<Flex align='center' justify='space-between'>
										<Flex align='center' gap={1}>
											<Text>{title}</Text>
											<SortIcon field={title} />
										</Flex>

										<Icon
											as={LuFilter}
											boxSize={4}
											color='gray.500'
											cursor='pointer'
											onClick={e => {
												e.stopPropagation()
												
											}}
										/>
									</Flex>
								</Th>
							))}
						</Tr>
					</Thead>
					<Tbody>
						{requests.map(request => (
							<Tr key={request.id} _hover={{ bg: 'gray.50' }}>
								<Td>{request.number}</Td>
								<Td>
									<HStack>
										<Text bg='custom.bgLight' px={2} borderRadius='4px'>
											{request.pharmacy.id}
										</Text>
										<Text>{request.pharmacy.address}</Text>
									</HStack>
								</Td>
								<Td fontSize='xs'>{request.createdAt}</Td>
								<Td>
									<PriorityIndicator priority={request.priority} />
								</Td>
								<Td maxW='200px'>
									<Text noOfLines={1} fontSize='xs'>
										{request.title}
									</Text>
								</Td>
								<Td fontSize='xs'>{request.category}</Td>
								<Td fontSize='xs'>{request.technician || '—'}</Td>
								<Td>
									<HStack color='green.600'>
										<TimeIcon boxSize={3} />
										<Text fontSize='xs'>{request.deadline}</Text>
									</HStack>
								</Td>
								<Td>
									<HStack color='green.600'>
										<TimeIcon boxSize={3} />
										<Text fontSize='xs'>{request.decision || '—'}</Text>
									</HStack>
								</Td>
								<Td>
									<Badge
										bg={statusBgColors[request.status]}
										px={3}
										py={1}
										borderRadius='full'
										textTransform='none'
									>
										{statusLabels[request.status]}
									</Badge>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</Box>
		</Box>
	)
}
