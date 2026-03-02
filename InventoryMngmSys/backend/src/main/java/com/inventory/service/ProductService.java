package com.inventory.service;

import com.inventory.dto.ProductDTO;
import com.inventory.exception.DuplicateResourceException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.model.Product;
import com.inventory.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
    
    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findByOrderByCreatedAtDesc(pageable)
                .map(product -> mapToDTO(product));
    }
    
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDTO(product);
    }
    
    @Transactional(readOnly = true)
    public ProductDTO getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "sku", sku));
        return mapToDTO(product);
    }
    
    @Transactional(readOnly = true)
    public Page<ProductDTO> searchProducts(String search, Pageable pageable) {
        return productRepository.searchProducts(search, pageable)
                .map(product -> mapToDTO(product));
    }
    
    public ProductDTO createProduct(ProductDTO productDTO) {
        if (productRepository.existsBySku(productDTO.getSku())) {
            throw new DuplicateResourceException("Product", "sku", productDTO.getSku());
        }
        
        Product product = mapToEntity(productDTO);
        Product savedProduct = productRepository.save(product);
        return mapToDTO(savedProduct);
    }
    
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        
        if (!existingProduct.getSku().equals(productDTO.getSku()) 
                && productRepository.existsBySkuAndIdNot(productDTO.getSku(), id)) {
            throw new DuplicateResourceException("Product", "sku", productDTO.getSku());
        }
        
        existingProduct.setSku(productDTO.getSku());
        existingProduct.setName(productDTO.getName());
        existingProduct.setDescription(productDTO.getDescription());
        existingProduct.setPrice(productDTO.getPrice());
        existingProduct.setQuantity(productDTO.getQuantity());
        
        Product updatedProduct = productRepository.save(existingProduct);
        return mapToDTO(updatedProduct);
    }
    
    public ProductDTO patchProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        
        if (productDTO.getSku() != null) {
            if (!existingProduct.getSku().equals(productDTO.getSku()) 
                    && productRepository.existsBySkuAndIdNot(productDTO.getSku(), id)) {
                throw new DuplicateResourceException("Product", "sku", productDTO.getSku());
            }
            existingProduct.setSku(productDTO.getSku());
        }
        
        if (productDTO.getName() != null) {
            existingProduct.setName(productDTO.getName());
        }
        
        if (productDTO.getDescription() != null) {
            existingProduct.setDescription(productDTO.getDescription());
        }
        
        if (productDTO.getPrice() != null) {
            existingProduct.setPrice(productDTO.getPrice());
        }
        
        if (productDTO.getQuantity() != null) {
            existingProduct.setQuantity(productDTO.getQuantity());
        }
        
        Product patchedProduct = productRepository.save(existingProduct);
        return mapToDTO(patchedProduct);
    }
    
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", "id", id);
        }
        productRepository.deleteById(id);
    }
    
    private ProductDTO mapToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
    
    private Product mapToEntity(ProductDTO productDTO) {
        return Product.builder()
                .sku(productDTO.getSku())
                .name(productDTO.getName())
                .description(productDTO.getDescription())
                .price(productDTO.getPrice())
                .quantity(productDTO.getQuantity())
                .build();
    }
}
