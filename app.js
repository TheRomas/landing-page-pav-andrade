/* 
  PAV ANDRADE - Premium Interactive JavaScript Controller
  Recursos: Header Scrolling, Wizard de Orçamento, Filtros da Galeria, Lightbox e WhatsApp Integration
*/

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. EFEITO SCROLL NO HEADER
  // ==========================================
  const header = document.querySelector('.header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Executar uma vez no carregamento caso a página seja atualizada no meio

  // ==========================================
  // 2. MENU RESPONSIVO (HAMBURGER)
  // ==========================================
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isExpanded = navLinks.classList.contains('active');
      menuToggle.innerHTML = isExpanded ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Fechar menu ao clicar em qualquer link
    navLinkItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }

  // ==========================================
  // 3. WIZARD DE AGENDAMENTO INTERATIVO
  // ==========================================
  
  // Estado do Agendamento
  const bookingState = {
    currentStep: 1,
    serviceId: '',
    serviceName: '',
    serviceRate: 0,
    address: '',
    area: 100, // área inicial padrão em m²
    visitDate: '',
    visitPeriod: '',
    estimatedPrice: 0
  };

  // Taxas de Pavimentação por m²
  const SERVICE_RATES = {
    'paving': { name: 'Pavimentação (Ruas & Lotes)', rate: 90 },
    'maintenance': { name: 'Manutenção & Reparos', rate: 60 },
    'sidewalks': { name: 'Calçadas & Pátios', rate: 75 }
  };

  // Seletores do Wizard
  const wizardBox = document.getElementById('wizard-box');
  const steps = document.querySelectorAll('.step-content');
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const progressBar = document.querySelector('.stepper-progress-bar');
  
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  
  // Elementos do Resumo Lateral
  const summaryService = document.getElementById('sum-service');
  const summaryLocation = document.getElementById('sum-location');
  const summaryArea = document.getElementById('sum-area');
  const summaryDate = document.getElementById('sum-date');
  const summaryPrice = document.getElementById('sum-price');

  // Inicializar o Wizard
  const initWizard = () => {
    // Escolha do Serviço (Etapa 1)
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
      card.addEventListener('click', () => {
        // Remover classe selecionada dos outros
        serviceCards.forEach(c => c.classList.remove('selected'));
        // Selecionar o atual
        card.classList.add('selected');
        
        const serviceId = card.getAttribute('data-service');
        bookingState.serviceId = serviceId;
        bookingState.serviceName = SERVICE_RATES[serviceId].name;
        bookingState.serviceRate = SERVICE_RATES[serviceId].rate;
        
        updateSummary();
        validateStep();
      });
    });

    // Input de Endereço (Etapa 2)
    const addressInput = document.getElementById('address-input');
    if (addressInput) {
      addressInput.addEventListener('input', (e) => {
        bookingState.address = e.target.value.trim();
        updateSummary();
        validateStep();
      });
    }

    // Slider de Área m² (Etapa 2)
    const areaSlider = document.getElementById('area-slider');
    const areaDisplay = document.getElementById('area-value');
    if (areaSlider && areaDisplay) {
      areaSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        bookingState.area = val;
        areaDisplay.textContent = val + ' m²';
        updateSummary();
      });
    }

    // Input de Data (Etapa 3)
    const dateInput = document.getElementById('visit-date');
    if (dateInput) {
      // Bloquear datas passadas no calendário
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
      
      dateInput.addEventListener('change', (e) => {
        bookingState.visitDate = e.target.value;
        updateSummary();
        validateStep();
      });
    }

    // Seleção de Período (Etapa 3)
    const periodChoices = document.querySelectorAll('.period-choice');
    periodChoices.forEach(choice => {
      choice.addEventListener('click', () => {
        periodChoices.forEach(p => p.classList.remove('selected'));
        choice.classList.add('selected');
        
        bookingState.visitPeriod = choice.getAttribute('data-period');
        updateSummary();
        validateStep();
      });
    });

    // Botões de Navegação
    if (btnNext) btnNext.addEventListener('click', () => navigateStep(1));
    if (btnPrev) btnPrev.addEventListener('click', () => navigateStep(-1));

    // Inicializar estados
    updateStepView();
    updateSummary();
    validateStep();
  };

  // Atualizar Resumo Lateral & Preço Estimado Dinâmico
  const updateSummary = () => {
    // Atualizar Serviço
    if (summaryService) {
      if (bookingState.serviceName) {
        summaryService.textContent = bookingState.serviceName;
        summaryService.classList.remove('pending');
      } else {
        summaryService.textContent = 'Pendente';
        summaryService.classList.add('pending');
      }
    }

    // Atualizar Localização
    if (summaryLocation) {
      if (bookingState.address) {
        summaryLocation.textContent = bookingState.address;
        summaryLocation.classList.remove('pending');
      } else {
        summaryLocation.textContent = 'Pendente';
        summaryLocation.classList.add('pending');
      }
    }

    // Atualizar Área
    if (summaryArea) {
      summaryArea.textContent = bookingState.area + ' m²';
    }

    // Atualizar Data & Período
    if (summaryDate) {
      if (bookingState.visitDate) {
        const dateParts = bookingState.visitDate.split('-');
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        const periodStr = bookingState.visitPeriod ? ` (${bookingState.visitPeriod})` : '';
        summaryDate.textContent = formattedDate + periodStr;
        summaryDate.classList.remove('pending');
      } else {
        summaryDate.textContent = 'A Definir';
        summaryDate.classList.add('pending');
      }
    }

    // Calcular Orçamento Dinâmico Estimado
    if (bookingState.serviceRate && bookingState.area) {
      let rawPrice = bookingState.serviceRate * bookingState.area;
      
      // Aplicar desconto de escala para projetos grandes (> 300m² - 10% de desconto)
      if (bookingState.area >= 300) {
        rawPrice = rawPrice * 0.9;
      }
      
      bookingState.estimatedPrice = rawPrice;
      
      if (summaryPrice) {
        summaryPrice.textContent = 'R$ ' + rawPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    } else {
      if (summaryPrice) summaryPrice.textContent = 'TBD';
      bookingState.estimatedPrice = 0;
    }
  };

  // Validar se o passo atual está preenchido corretamente
  const validateStep = () => {
    let isValid = false;

    if (bookingState.currentStep === 1) {
      isValid = bookingState.serviceId !== '';
    } else if (bookingState.currentStep === 2) {
      isValid = bookingState.address !== '' && bookingState.area > 0;
    } else if (bookingState.currentStep === 3) {
      isValid = bookingState.visitDate !== '' && bookingState.visitPeriod !== '';
    }

    if (btnNext) {
      if (isValid) {
        btnNext.removeAttribute('disabled');
        btnNext.style.opacity = '1';
        btnNext.style.cursor = 'pointer';
      } else {
        btnNext.setAttribute('disabled', 'true');
        btnNext.style.opacity = '0.5';
        btnNext.style.cursor = 'not-allowed';
      }
    }
  };

  // Atualizar visualização das etapas
  const updateStepView = () => {
    // Ocultar todos os passos e mostrar o ativo
    steps.forEach((step, idx) => {
      if (idx + 1 === bookingState.currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // Atualizar barra de progresso no topo
    if (progressBar) {
      const percentage = ((bookingState.currentStep - 1) / 2) * 100;
      progressBar.style.width = percentage + '%';
    }

    // Atualizar marcadores redondos (Stepper)
    stepIndicators.forEach((ind, idx) => {
      const stepNum = idx + 1;
      ind.classList.remove('active', 'completed');
      
      if (stepNum === bookingState.currentStep) {
        ind.classList.add('active');
      } else if (stepNum < bookingState.currentStep) {
        ind.classList.add('completed');
      }
    });

    // Atualizar Botão Voltar (Ocultar na Etapa 1)
    if (btnPrev) {
      if (bookingState.currentStep === 1) {
        btnPrev.style.display = 'none';
      } else {
        btnPrev.style.display = 'inline-flex';
      }
    }

    // Atualizar Texto do Botão Avançar (Confirmar na última etapa)
    if (btnNext) {
      if (bookingState.currentStep === 3) {
        btnNext.innerHTML = 'Confirmar Agendamento <i class="fas fa-check"></i>';
        btnNext.classList.add('btn-primary');
      } else {
        const nextLabels = { 1: 'Localização & Área', 2: 'Agendar Visita' };
        btnNext.innerHTML = `Próximo: ${nextLabels[bookingState.currentStep]} <i class="fas fa-arrow-right"></i>`;
      }
    }
  };

  // Navegar entre Etapas
  const navigateStep = (direction) => {
    // Se avançar na etapa 3, significa finalizar e enviar!
    if (bookingState.currentStep === 3 && direction === 1) {
      finishBooking();
      return;
    }

    bookingState.currentStep += direction;
    // Prevenir extrapolação
    if (bookingState.currentStep < 1) bookingState.currentStep = 1;
    if (bookingState.currentStep > 3) bookingState.currentStep = 3;

    updateStepView();
    validateStep();
  };

  // Finalização do Agendamento e Redirecionamento para o WhatsApp
  const finishBooking = () => {
    // Ocultar toda a estrutura do wizard (Formulário + Resumo) e mostrar Tela de Sucesso
    const wizardFormBox = document.querySelector('.wizard-form-box');
    const summaryCard = document.querySelector('.summary-card');
    
    if (wizardFormBox) {
      const dateParts = bookingState.visitDate.split('-');
      const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      const priceStr = bookingState.estimatedPrice > 0 
        ? `R$ ${bookingState.estimatedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
        : 'A ser validado';

      // Substituir conteúdo do formulário por mensagem de sucesso
      wizardFormBox.innerHTML = `
        <div class="booking-complete">
          <div class="success-icon-box">
            <i class="fas fa-check"></i>
          </div>
          <h3 class="complete-title">Solicitação Recebida!</h3>
          <p class="complete-desc">
            Seu agendamento para a visita técnica gratuita foi pré-cadastrado com sucesso.<br><br>
            <strong>Serviço:</strong> ${bookingState.serviceName}<br>
            <strong>Tamanho:</strong> ${bookingState.area} m²<br>
            <strong>Endereço:</strong> ${bookingState.address}<br>
            <strong>Data da Visita:</strong> ${formattedDate} (${bookingState.visitPeriod})<br>
            <strong>Valor Estimado:</strong> <span class="text-accent">${priceStr}</span>
          </p>
          <button id="btn-whatsapp-redirect" class="btn btn-primary">
            <i class="fab fa-whatsapp"></i> Confirmar no WhatsApp
          </button>
        </div>
      `;

      // Ocultar painel de resumo lateral (opcional ou opacidade reduzida)
      if (summaryCard) {
        summaryCard.style.opacity = '0.5';
        summaryCard.style.pointerEvents = 'none';
      }

      // Adicionar evento para redirecionar para o WhatsApp
      const btnWA = document.getElementById('btn-whatsapp-redirect');
      if (btnWA) {
        btnWA.addEventListener('click', () => {
          triggerWhatsAppRedirect(formattedDate, priceStr);
        });
      }
      
      // Auto redirecionar após 3 segundos para comodidade
      setTimeout(() => {
        triggerWhatsAppRedirect(formattedDate, priceStr);
      }, 3500);
    }
  };

  // Disparar o Link do WhatsApp com mensagem customizada preenchida
  const triggerWhatsAppRedirect = (formattedDate, priceStr) => {
    const phoneNumber = "5511912617169";
    const textMsg = `Olá Pav Andrade! Gostaria de agendar a minha visita técnica gratuita solicitada no site.
    
*DADOS DO ORÇAMENTO:*
🛠️ *Serviço:* ${bookingState.serviceName}
📐 *Área do Projeto:* ${bookingState.area} m²
📍 *Endereço:* ${bookingState.address}
📅 *Data Solicitada:* ${formattedDate}
🕒 *Período:* ${bookingState.visitPeriod}
💰 *Preço Estimado:* ${priceStr}

Favor confirmar a disponibilidade para esta data. Obrigado!`;

    const encodedText = encodeURIComponent(textMsg);
    const waUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  // Inicializar o Wizard de Orçamento se estiver presente na página
  if (wizardBox) {
    initWizard();
  }

  // ==========================================
  // 4. GALERIA DE PROJETOS DINÂMICA
  // ==========================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const btnLoadMore = document.getElementById('btn-load-more');

  // Funcionalidade de Filtro
  if (filterButtons.length > 0 && galleryItems.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remover active de todos e adicionar no clicado
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterCategory = btn.getAttribute('data-filter');

        let visibleCount = 0;
        galleryItems.forEach(item => {
          const itemCategory = item.getAttribute('data-category');
          
          // Verificar se bate com o filtro
          const matchesFilter = filterCategory === 'all' || itemCategory === filterCategory;
          const isInitial = !item.classList.contains('extra-project');

          if (matchesFilter && isInitial) {
            item.classList.remove('hidden');
            visibleCount++;
          } else {
            item.classList.add('hidden');
          }
        });

        // Resetar o botão de carregar mais caso mude de filtro
        if (btnLoadMore) {
          // Mostrar o botão apenas se houver projetos extras para a categoria atual que estão escondidos
          const hasHiddenExtras = Array.from(galleryItems).some(item => {
            const matchesFilter = filterCategory === 'all' || item.getAttribute('data-category') === filterCategory;
            return matchesFilter && item.classList.contains('extra-project') && item.classList.contains('hidden');
          });
          
          btnLoadMore.style.display = hasHiddenExtras ? 'inline-flex' : 'none';
        }
      });
    });
  }

  // Funcionalidade do "Carregar Mais"
  if (btnLoadMore && galleryItems.length > 0) {
    btnLoadMore.addEventListener('click', () => {
      // Obter o filtro ativo atual
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

      // Revelar no máximo 3 itens extras de cada vez que combinam com o filtro
      let revealedCount = 0;
      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        const matchesFilter = activeFilter === 'all' || itemCategory === activeFilter;
        
        if (matchesFilter && item.classList.contains('extra-project') && item.classList.contains('hidden') && revealedCount < 3) {
          item.classList.remove('hidden');
          // Adicionar uma leve animação de fade-in no JS
          item.style.opacity = '0';
          setTimeout(() => {
            item.style.transition = 'opacity 0.4s ease';
            item.style.opacity = '1';
          }, 50);
          revealedCount++;
        }
      });

      // Ocultar o botão se não houver mais projetos escondidos para esta categoria
      const remainingHidden = Array.from(galleryItems).some(item => {
        const matchesFilter = activeFilter === 'all' || item.getAttribute('data-category') === activeFilter;
        return matchesFilter && item.classList.contains('extra-project') && item.classList.contains('hidden');
      });

      if (!remainingHidden) {
        btnLoadMore.style.display = 'none';
      }
    });
  }

  // ==========================================
  // 5. LIGHTBOX DE IMAGENS NA GALERIA
  // ==========================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightbox && lightboxImg && lightboxClose) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('.gallery-img');
        const title = item.querySelector('.gallery-item-title') || item.querySelector('.gallery-overlay-title');
        const loc = item.querySelector('.gallery-item-loc') || item.querySelector('.gallery-overlay-loc');
        
        if (img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || 'Projeto Pav Andrade';
          
          if (lightboxCaption && title && loc) {
            lightboxCaption.innerHTML = `${title.textContent} <br> <span style="color: var(--accent); font-size: 0.9rem;">${loc.textContent}</span>`;
          }
          
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden'; // Impedir scroll do fundo
        }
      });
    });

    // Fechar ao clicar no X
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = 'auto';
    });

    // Fechar ao clicar fora da imagem
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });

    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // ==========================================
  // 6. FORMULÁRIO DE CONTATO (SIMULAÇÃO E FEEDBACK)
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validar inputs
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const msg = document.getElementById('contact-message').value.trim();

      if (!name || !email || !phone || !msg) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      // Substituir o formulário por feedback visual de sucesso
      const formParent = contactForm.parentElement;
      contactForm.style.transition = 'opacity 0.3s ease';
      contactForm.style.opacity = '0';
      
      setTimeout(() => {
        contactForm.style.display = 'none';
        
        const successBox = document.createElement('div');
        successBox.className = 'booking-complete';
        successBox.style.padding = '20px 0';
        successBox.innerHTML = `
          <div class="success-icon-box" style="margin: 0 auto 20px;">
            <i class="fas fa-check"></i>
          </div>
          <h3 class="complete-title" style="font-size: 1.5rem;">Mensagem Enviada!</h3>
          <p class="complete-desc" style="font-size: 0.9rem; margin-bottom: 20px;">
            Obrigado pelo contato, <strong>${name}</strong>. Nossa equipe técnica da Pav Andrade recebeu sua mensagem e responderá em até 24 horas úteis.
          </p>
          <button id="btn-contact-reset" class="btn btn-secondary btn-sm">
            Enviar Outra Mensagem
          </button>
        `;
        
        formParent.appendChild(successBox);
        
        // Botão para resetar formulário
        const btnReset = document.getElementById('btn-contact-reset');
        if (btnReset) {
          btnReset.addEventListener('click', () => {
            successBox.remove();
            contactForm.reset();
            contactForm.style.display = 'block';
            setTimeout(() => {
              contactForm.style.opacity = '1';
            }, 50);
          });
        }
      }, 300);
    });
  }

});
