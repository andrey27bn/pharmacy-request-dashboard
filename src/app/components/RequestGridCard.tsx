import { Box, VStack, HStack, Text, Badge, Flex, Icon } from '@chakra-ui/react'
import { Request } from '@/types'
import { statusLabels, statusBgColors } from '@/data/mockData'
import PriorityIndicator from './PriorityIndicator'
import { GoCheckCircle } from 'react-icons/go'

interface RequestGridCardProps {
	request: Request
}

export default function RequestGridCard({ request }: RequestGridCardProps) {
	return (
		<Box
			bg='white'
			borderRadius='12px'
			border='1px solid'
			borderColor='gray.200'
			p='16px 20px'
			transition='all 0.2s'
			_hover={{ boxShadow: 'md', borderColor: 'gray.300' }}
		>
			<VStack align='stretch' spacing={4}>
				{/* Верхний ряд: тема + приоритет + статус */}
				<Flex justify='space-between' align='center'>
					<Text
						fontWeight='600'
						fontSize='17px'
						color='#1A1A1A'
						noOfLines={1}
						flex={1}
						mr={3}
					>
						{request.title}
					</Text>
					<HStack spacing={3} flexShrink={0}>
						<PriorityIndicator priority={request.priority} showLabel={false} />
						<Badge
							bg={statusBgColors[request.status]}
							color='#1A1A1A'
							px='12px'
							py='5px'
							borderRadius='8px'
							fontSize='14px'
							fontWeight='600'
							textTransform='none'
						>
							{statusLabels[request.status]}
						</Badge>
					</HStack>
				</Flex>

				{/* Нижний ряд: номер/адрес + таймеры */}
				<Flex justify='space-between' align='flex-end'>
					<HStack spacing={3} align='center'>
						<Box bg='#F2F2F2' px='10px' py='4px' borderRadius='6px'>
							<Text fontWeight='700' fontSize='15px' color='#1A1A1A'>
								{request.number}
							</Text>
						</Box>
						<Text color='gray.500' fontSize='15px' noOfLines={1}>
							{request.pharmacy.address}
						</Text>
					</HStack>

					<HStack spacing={2} color='#0E7411'>
						<Box
							display='flex'
							alignItems='center'
							justifyContent='center'
							bg='white'
							borderRadius='full'
							boxSize='20px'
						>
							<Icon as={GoCheckCircle} boxSize='14px' color='#0E7411' />
						</Box>
						<Text fontWeight='400' fontSize='14px'>
							{request.decision || '00:00:00'}
						</Text>
					</HStack>
				</Flex>
			</VStack>
		</Box>
	)
}
