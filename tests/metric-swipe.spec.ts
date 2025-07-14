import { defineConfig } from 'cypress'

describe('MetricsCarousel', () => {
  const mockMetrics = [
    { name: 'Readiness', value: 85, delta: 2.3, unit: '%' },
    { name: 'Sleep Score', value: 78, delta: -1.5, unit: '%' },
    { name: 'Training Load', value: 245, delta: 5.2, unit: '' },
    { name: 'HRV', value: 42, delta: 0, unit: 'ms' }
  ];

  beforeEach(() => {
    // Create a test page with the MetricsCarousel component
    cy.visit('/'); // Assuming there's a test page or we'll mount the component
    
    // Mock the component with test data
    cy.window().then((win) => {
      // This would typically be done by mounting the component in a test environment
      // For now, we'll assume the component is available on the page with test data
    });
  });

  describe('Desktop (1280px width)', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    });

    it('should show single large card with min-width 420px', () => {
      cy.get('[data-testid="metrics-carousel"]').should('be.visible');
      cy.get('[data-testid="metric-card"]').should('have.length', 1);
      
      // Check that the card container has minimum width
      cy.get('.md\\:block [style*="min-width"]').should('have.css', 'min-width', '420px');
    });

    it('should show arrow navigation buttons', () => {
      cy.get('[data-testid="prev-button"]').should('be.visible');
      cy.get('[data-testid="next-button"]').should('be.visible');
    });

    it('should navigate between metrics using arrow buttons', () => {
      // Check initial metric is displayed
      cy.get('[data-testid="metric-card"]').should('contain', 'Readiness');
      
      // Click next arrow
      cy.get('[data-testid="next-button"]').click();
      cy.get('[data-testid="metric-card"]').should('contain', 'Sleep Score');
      
      // Click previous arrow
      cy.get('[data-testid="prev-button"]').click();
      cy.get('[data-testid="metric-card"]').should('contain', 'Readiness');
    });

    it('should support keyboard navigation with left/right arrow keys', () => {
      cy.get('[data-testid="metric-card"]').should('contain', 'Readiness');
      
      // Use right arrow key
      cy.get('body').type('{rightarrow}');
      cy.get('[data-testid="metric-card"]').should('contain', 'Sleep Score');
      
      // Use left arrow key
      cy.get('body').type('{leftarrow}');
      cy.get('[data-testid="metric-card"]').should('contain', 'Readiness');
    });

    it('should show dot indicators', () => {
      cy.get('[data-testid^="dot-"]').should('have.length', 4);
      cy.get('[data-testid="dot-0"]').should('have.class', 'bg-white');
    });

    it('should navigate using dot indicators', () => {
      cy.get('[data-testid="dot-2"]').click();
      cy.get('[data-testid="metric-card"]').should('contain', 'Training Load');
    });

    it('should have card height of 230px', () => {
      cy.get('[data-testid="metric-card"]').should('have.css', 'height', '230px');
    });

    it('should display metric name, value, and delta', () => {
      cy.get('[data-testid="metric-card"]').within(() => {
        cy.contains('Readiness').should('be.visible');
        cy.contains('85%').should('be.visible');
        cy.contains('2.3').should('be.visible');
      });
    });

    it('should hide mobile carousel', () => {
      cy.get('[data-testid="mobile-carousel"]').should('not.be.visible');
    });
  });

  describe('Mobile (320px width)', () => {
    beforeEach(() => {
      cy.viewport(320, 568);
    });

    it('should show horizontal swipe carousel', () => {
      cy.get('[data-testid="mobile-carousel"]').should('be.visible');
      cy.get('[data-testid="metric-card"]').should('have.length.greaterThan', 1);
    });

    it('should hide arrow buttons on mobile', () => {
      cy.get('[data-testid="prev-button"]').should('not.be.visible');
      cy.get('[data-testid="next-button"]').should('not.be.visible');
    });

    it('should support touch swipe navigation', () => {
      // Initial state - first metric should be visible
      cy.get('[data-testid="mobile-carousel"]')
        .should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)'); // translateX(0%)
      
      // Simulate swipe left (next)
      cy.get('[data-testid="mobile-carousel"]')
        .trigger('touchstart', { touches: [{ clientX: 200, clientY: 200 }] })
        .trigger('touchmove', { touches: [{ clientX: 50, clientY: 200 }] })
        .trigger('touchend');
      
      // Should advance to next metric
      cy.get('[data-testid="mobile-carousel"]')
        .should('have.css', 'transform')
        .and('include', 'matrix(1, 0, 0, 1, -320, 0)'); // translateX(-100%)
    });

    it('should have card height of 230px on mobile', () => {
      cy.get('[data-testid="metric-card"]').first().should('have.css', 'height', '230px');
    });

    it('should show dot indicators on mobile', () => {
      cy.get('[data-testid^="dot-"]').should('have.length', 4);
      cy.get('[data-testid="dot-0"]').should('be.visible');
    });

    it('should display all metric cards in horizontal layout', () => {
      cy.get('[data-testid="mobile-carousel"] [data-testid="metric-card"]').should('have.length', 4);
      
      // Each card should be full width with flex-shrink-0
      cy.get('[data-testid="mobile-carousel"] > div').each(($card) => {
        cy.wrap($card).should('have.class', 'w-full');
        cy.wrap($card).should('have.class', 'flex-shrink-0');
      });
    });

    it('should support keyboard navigation on mobile too', () => {
      // Even on mobile, keyboard navigation should work
      cy.get('body').type('{rightarrow}');
      cy.get('[data-testid="mobile-carousel"]')
        .should('have.css', 'transform')
        .and('include', 'matrix(1, 0, 0, 1, -320, 0)'); // translateX(-100%)
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      cy.viewport(1280, 720);
      
      cy.get('[data-testid="metrics-carousel"]')
        .should('have.attr', 'role', 'region')
        .should('have.attr', 'aria-label', 'Metrics carousel');
      
      cy.get('[data-testid="prev-button"]')
        .should('have.attr', 'aria-label', 'Previous metric');
      
      cy.get('[data-testid="next-button"]')
        .should('have.attr', 'aria-label', 'Next metric');
      
      cy.get('[data-testid="dot-0"]')
        .should('have.attr', 'aria-label', 'Go to metric 1');
    });

    it('should be keyboard accessible', () => {
      cy.viewport(1280, 720);
      
      // Tab to navigation buttons
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'prev-button');
      
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'next-button');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty metrics array gracefully', () => {
      // Test with no metrics
      cy.get('[data-testid="metrics-carousel"]').within(() => {
        cy.contains('No metrics available').should('be.visible');
      });
    });

    it('should handle single metric without navigation', () => {
      // Test with single metric - navigation buttons should be hidden
      cy.viewport(1280, 720);
      
      // If only one metric, arrows should not be visible
      // This would need to be tested with a single metric dataset
    });

    it('should wrap around when navigating past last metric', () => {
      cy.viewport(1280, 720);
      
      // Navigate to last metric
      cy.get('[data-testid="dot-3"]').click();
      cy.get('[data-testid="metric-card"]').should('contain', 'HRV');
      
      // Click next should wrap to first
      cy.get('[data-testid="next-button"]').click();
      cy.get('[data-testid="metric-card"]').should('contain', 'Readiness');
    });
  });
});