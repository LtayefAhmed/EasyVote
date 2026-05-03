package com.easyvote.backend.service;

import com.easyvote.backend.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class PhotoUploadService {

    @Value("${easyvote.upload.dir:./uploads}")
    private String uploadDir;

    @Value("${easyvote.upload.base-url:http://localhost:8082/uploads}")
    private String baseUrl;

    /**
     * Sauvegarde une photo sur le disque et retourne l'URL publique.
     */
    public String savePhoto(MultipartFile file) {
        // Validations
        if (file.isEmpty()) {
            throw new BusinessException("Fichier vide");
        }
        if (file.getSize() > 5_000_000) {
            throw new BusinessException("Fichier trop volumineux (max 5MB)");
        }
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new BusinessException("Format non supporté. Seules les images sont acceptées.");
        }

        try {
            // Extraire l'extension du fichier original
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            // Générer un nom unique
            String fileName = UUID.randomUUID().toString() + extension;

            // Créer le dossier si nécessaire
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // Sauvegarder le fichier
            Path targetPath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String publicUrl = baseUrl + "/" + fileName;
            log.info("Photo uploaded: {} → {}", originalName, publicUrl);
            return publicUrl;

        } catch (IOException e) {
            log.error("Erreur upload photo : {}", e.getMessage(), e);
            throw new BusinessException("Erreur lors de l'upload du fichier");
        }
    }

    /**
     * Supprime une photo du disque (utilitaire pour plus tard).
     */
    public void deletePhoto(String photoUrl) {
        if (photoUrl == null || photoUrl.isBlank()) return;

        try {
            // Extraire le nom du fichier depuis l'URL
            String fileName = photoUrl.substring(photoUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("Photo supprimée : {}", fileName);
            }
        } catch (IOException e) {
            log.warn("Impossible de supprimer la photo {} : {}", photoUrl, e.getMessage());
        }
    }
}
