import { Icon, Tooltip, HStack, Text } from '@chakra-ui/react'
import {
	LuChevronsUp,
	LuChevronUp,
	LuDiamond,
	LuChevronDown,
} from 'react-icons/lu'
import { Priority } from '@/types'

interface PriorityIndicatorProps {
	priority: Priority
	showLabel?: boolean
}

const priorityConfig = {
	critical: { icon: LuChevronsUp, label: 'Критич.' },
	high: { icon: LuChevronUp, label: 'Высокий' },
	medium: { icon: LuDiamond, label: 'Средний' },
	low: { icon: LuChevronDown, label: 'Низкий' },
}

export default function PriorityIndicator({
	priority,
	showLabel = true,
}: PriorityIndicatorProps) {
	const config = priorityConfig[priority]

	return (
		<Tooltip label={config.label}>
			<HStack spacing={1} display='inline-flex'>
				<Icon as={config.icon} color={`custom.${priority}`} boxSize='16px' />
				{showLabel && (
					<Text fontSize='sm' color='gray.600'>
						{config.label}
					</Text>
				)}
			</HStack>
		</Tooltip>
	)
}
