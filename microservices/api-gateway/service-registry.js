/**
 * Service Registry - Configuration-Based Service Discovery
 * Web Services & SOA Laboratory - Lab 7
 * Institution: Dhirubhai Ambani University (formerly DA-IICT)
 *
 * This module acts as the "service registry" for the API Gateway.
 * Service locations (URLs/ports) are read from environment variables at startup.
 * No service URL is hard-coded inside the route-handling logic - all routing
 * decisions reference this registry, enabling location changes without any code edits.
 *
 * To change a service location: update the environment variable only.
 * Example:  USER_SERVICE_URL=http://new-host:4001  -> gateway re-routes automatically.
 */

'use strict';

/**
 * Build and return the live service registry from environment variables.
 * Called once at gateway startup; the result is shared across all route handlers.
 */
function buildRegistry() {
  const registry = {
    'user-service': {
      name:        'User Service',
      url:         process.env.USER_SERVICE_URL    || 'http://localhost:3001',
      pathPrefix:  '/users',
      description: 'Manages student/user records',
      version:     '1.0.0',
    },
    'product-service': {
      name:        'Product Service',
      url:         process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
      pathPrefix:  '/products',
      description: 'Manages academic courses/products',
      version:     '1.0.0',
    },
    'order-service': {
      name:        'Order Service',
      url:         process.env.ORDER_SERVICE_URL   || 'http://localhost:3003',
      pathPrefix:  '/orders',
      description: 'Manages course enrollments/orders',
      version:     '1.0.0',
    },
  };

  return registry;
}

module.exports = { buildRegistry };
