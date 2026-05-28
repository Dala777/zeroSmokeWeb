import { useState, useCallback, useEffect, useRef } from "react"
import styled from "styled-components"
import { ExternalLink, Maximize2, Minimize2 } from "lucide-react"
import { AppColors } from "../../styles/colors"

interface GrafanaEmbedProps {
  src: string
  title?: string
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: ${AppColors.cardBackground};
  border: 1px solid rgba(0, 0, 0, 0.06);
`

const IframeStyled = styled.iframe<{ $visible: boolean }>`
  width: 100%;
  height: 550px;
  border: none;
  display: ${(p) => (p.$visible ? "block" : "none")};

  @media (max-width: 768px) {
    height: 380px;
  }
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 12px;
  background: ${AppColors.background};
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`

const ToolbarButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: ${AppColors.cardBackground};
  color: ${AppColors.textSecondary};
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;

  &:hover {
    border-color: ${AppColors.primary};
    color: ${AppColors.accent};
  }
`

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${AppColors.cardBackground};
  z-index: 2;
`

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.06);
  border-top-color: ${AppColors.primary};
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const LoadingText = styled.p`
  margin: 12px 0 0;
  color: ${AppColors.textSecondary};
  font-size: 0.85rem;
`

const ErrorOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${AppColors.cardBackground};
  z-index: 2;
  padding: 24px;
  text-align: center;
`

const ErrorText = styled.p`
  color: ${AppColors.error};
  font-size: 0.9rem;
  margin: 0;
`

const RetryButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${AppColors.primary};
  background: transparent;
  color: ${AppColors.primary};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;

  &:hover {
    background: ${AppColors.primary}22;
  }
`

const FullscreenOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: ${AppColors.background};
  display: flex;
  flex-direction: column;
`

const FullscreenIframe = styled.iframe`
  flex: 1;
  width: 100%;
  border: none;
`

const FullscreenToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: ${AppColors.cardBackground};
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`

const FullscreenTitle = styled.span`
  font-weight: 600;
  color: ${AppColors.text};
  font-size: 0.9rem;
`

const GrafanaEmbed: React.FC<GrafanaEmbedProps> = ({ src, title = "Panel Grafana" }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const handleLoad = useCallback(() => {
    setLoading(false)
    setError(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const handleError = useCallback(() => {
    setLoading(false)
    setError(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setError(true)
      }
    }, 30000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [loading])

  useEffect(() => {
    setLoading(true)
    setError(false)
  }, [src])

  const openInNewTab = useCallback(() => {
    window.open(src, "_blank", "noopener")
  }, [src])

  if (fullscreen) {
    return (
      <FullscreenOverlay>
        <FullscreenToolbar>
          <FullscreenTitle>{title}</FullscreenTitle>
          <ToolbarButton onClick={() => setFullscreen(false)}>
            <Minimize2 size={16} /> Salir de pantalla completa
          </ToolbarButton>
        </FullscreenToolbar>
        <FullscreenIframe src={src} title={title} />
      </FullscreenOverlay>
    )
  }

  return (
    <Wrapper>
      <Toolbar>
        <ToolbarButton onClick={openInNewTab} title="Abrir en nueva pestaña">
          <ExternalLink size={14} /> Abrir en Grafana
        </ToolbarButton>
        <ToolbarButton onClick={() => setFullscreen(true)} title="Ver en pantalla completa">
          <Maximize2 size={14} /> Pantalla completa
        </ToolbarButton>
      </Toolbar>

      {loading && (
        <LoadingOverlay>
          <div style={{ textAlign: "center" }}>
            <Spinner />
            <LoadingText>Cargando panel Grafana...</LoadingText>
          </div>
        </LoadingOverlay>
      )}

      {error && (
        <ErrorOverlay>
          <ErrorText>No se pudo cargar el panel de Grafana.</ErrorText>
          <ErrorText style={{ fontSize: "0.8rem", color: AppColors.textSecondary }}>
            Verifica que Grafana esté corriendo en la URL configurada.
          </ErrorText>
          <RetryButton onClick={() => { setLoading(true); setError(false) }}>
            Reintentar
          </RetryButton>
        </ErrorOverlay>
      )}

      <IframeStyled
        ref={iframeRef}
        src={src}
        title={title}
        $visible={!error}
        onLoad={handleLoad}
        onError={handleError}
        allow="fullscreen"
      />
    </Wrapper>
  )
}

export default GrafanaEmbed
