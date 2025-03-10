import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/components/translations-context";

interface BroadcastButtonProps {
  isSessionActive: boolean
  onClick: () => void
}

export function BroadcastButton({ isSessionActive, onClick }: BroadcastButtonProps) {
  const { t } = useTranslations();
  return (
    <Button
      variant="custom"
      className={`w-full py-7 px-8 text-xl font-bold flex items-center justify-center gap-3 motion-preset-shake rounded-full transition-all duration-300 ${!isSessionActive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
      onClick={onClick}
      style={{ fontFamily: 'var(--font-pt-sans-narrow)' }}
    >
      {isSessionActive && (
        <Badge variant="secondary" className="animate-pulse bg-white/20 text-white px-3 py-1 font-bold rounded-full">
          {t('broadcast.live')}
        </Badge>
      )}
      {isSessionActive ? t('broadcast.end') : t('broadcast.start')}
    </Button>
  )
} 