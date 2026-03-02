package com.inventory.controller;

import com.inventory.dto.APIResponseDTO;
import com.inventory.dto.ProductDTO;
import com.inventory.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    private final ProductService productService;
    
    public ProductController(ProductService productService) {
        this.productService = productService;
    }
    
    @GetMapping
    public ResponseEntity<APIResponseDTO> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProductDTO> products = productService.getAllProducts(pageable);
        
        return ResponseEntity.ok(APIResponseDTO.success("Products retrieved successfully", products));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<APIResponseDTO> getProductById(@PathVariable Long id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(APIResponseDTO.success("Product retrieved successfully", product));
    }
    
    @GetMapping("/sku/{sku}")
    public ResponseEntity<APIResponseDTO> getProductBySku(@PathVariable String sku) {
        ProductDTO product = productService.getProductBySku(sku);
        return ResponseEntity.ok(APIResponseDTO.success("Product retrieved successfully", product));
    }
    
    @GetMapping("/search")
    public ResponseEntity<APIResponseDTO> searchProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.searchProducts(q, pageable);
        
        return ResponseEntity.ok(APIResponseDTO.success("Search results retrieved successfully", products));
    }
    
    @PostMapping
    public ResponseEntity<APIResponseDTO> createProduct(@Valid @RequestBody ProductDTO productDTO) {
        ProductDTO createdProduct = productService.createProduct(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(APIResponseDTO.success("Product created successfully", createdProduct));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<APIResponseDTO> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDTO productDTO) {
        ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(APIResponseDTO.success("Product updated successfully", updatedProduct));
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<APIResponseDTO> patchProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        ProductDTO patchedProduct = productService.patchProduct(id, productDTO);
        return ResponseEntity.ok(APIResponseDTO.success("Product patched successfully", patchedProduct));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponseDTO> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(APIResponseDTO.success("Product deleted successfully", null));
    }
}
