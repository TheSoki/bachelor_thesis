#include "../lib/Config/DEV_Config.h"

#include "png_to_bmp.h"
#include "environment.h"

#include <stdio.h>
#include <png.h>
#include <stdint.h>
#include <stdlib.h>


int saveBitmap(const char *filename, unsigned int width, unsigned int height, png_bytep *rowPointers) {
    FILE *fp;
    uint32_t fileSize, pixelArrayOffset, dibHeaderSize;
    uint16_t colorPlanes, bitsPerPixel;
    uint32_t compressionMethod, imageSize, horizontalResolution, verticalResolution;
    uint32_t colorsInPalette, importantColors;

    // Open BMP file for writing
    fp = fopen(filename, "wb");
    if (!fp) {
        Debug("Error: Failed to create BMP file.\n");
        return 1;
    }

    // BMP file header
    fileSize = width * height * 3 + 54; // 3 bytes per pixel, plus 54-byte header
    fwrite("BM", 2, 1, fp); // Signature
    fwrite(&fileSize, 4, 1, fp); // File size
    fwrite("\x00\x00\x00\x00", 4, 1, fp); // Reserved
    pixelArrayOffset = 54;
    fwrite(&pixelArrayOffset, 4, 1, fp); // Pixel array offset

    // DIB header
    dibHeaderSize = 40;
    fwrite(&dibHeaderSize, 4, 1, fp); // DIB header size
    fwrite(&width, 4, 1, fp); // Image width
    fwrite(&height, 4, 1, fp); // Image height
    colorPlanes = 1;
    fwrite(&colorPlanes, 2, 1, fp); // Color planes
    bitsPerPixel = 24;
    fwrite(&bitsPerPixel, 2, 1, fp); // Bits per pixel
    compressionMethod = 0;
    fwrite(&compressionMethod, 4, 1, fp); // Compression method
    imageSize = width * height * 3;
    fwrite(&imageSize, 4, 1, fp); // Image size
    horizontalResolution = 0;
    fwrite(&horizontalResolution, 4, 1, fp); // Horizontal resolution
    verticalResolution = 0;
    fwrite(&verticalResolution, 4, 1, fp); // Vertical resolution
    colorsInPalette = 0;
    fwrite(&colorsInPalette, 4, 1, fp); // Colors in palette
    importantColors = 0;
    fwrite(&importantColors, 4, 1, fp); // Important colors

    // Write image data (pixel array)
    for (int y = height - 1; y >= 0; y--) {
        for (int x = 0; x < width; x++) {
            fwrite(&rowPointers[y][x * 4], 3, 1, fp); // Write BGR pixel data
        }
    }

    // Close BMP file
    fclose(fp);

    return 0;
}

int convertPNGtoBMP(void) {
    FILE *fp;
    png_structp pngPtr;
    png_infop infoPtr;
    png_bytep *rowPointers;
    unsigned int width, height;
    int bitDepth, colorType;
    int bmpResult;

    // Open the PNG file
    fp = fopen(RPI_ENV_IMAGE_PNG_FILENAME, "rb");
    if (!fp) {
        Debug("Error: Failed to open PNG file.\n");
        return 1;
    }

    // Initialize libpng structures
    pngPtr = png_create_read_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
    if (!pngPtr) {
        fclose(fp);
        return 1;
    }

    infoPtr = png_create_info_struct(pngPtr);
    if (!infoPtr) {
        png_destroy_read_struct(&pngPtr, (png_infopp)NULL, (png_infopp)NULL);
        fclose(fp);
        return 1;
    }

    // Set up error handling
    if (setjmp(png_jmpbuf(pngPtr))) {
        png_destroy_read_struct(&pngPtr, &infoPtr, NULL);
        fclose(fp);
        return 1;
    }

    // Initialize PNG IO
    png_init_io(pngPtr, fp);

    // Read PNG header
    png_read_info(pngPtr, infoPtr);
    png_get_IHDR(pngPtr, infoPtr, &width, &height, &bitDepth, &colorType, NULL, NULL, NULL);

    // Ensure PNG image is in RGB format
    if (colorType != PNG_COLOR_TYPE_RGB && colorType != PNG_COLOR_TYPE_RGBA) {
        Debug("Error: PNG image must be in RGB format.\n");
        png_destroy_read_struct(&pngPtr, &infoPtr, NULL);
        fclose(fp);
        return 1;
    }

    // Allocate memory for row pointers
    rowPointers = (png_bytep*)malloc(sizeof(png_bytep) * height);
    for (int y = 0; y < height; y++) {
        rowPointers[y] = (png_byte*)malloc(png_get_rowbytes(pngPtr, infoPtr));
    }

    // Read PNG image data
    png_read_image(pngPtr, rowPointers);

    // Close PNG file
    fclose(fp);

    // Create BMP file
    bmpResult = saveBitmap(RPI_ENV_IMAGE_BMP_FILENAME, width, height, rowPointers);

    // Clean up libpng resources
    png_destroy_read_struct(&pngPtr, &infoPtr, NULL);
    for (int y = 0; y < height; y++) {
        free(rowPointers[y]);
    }
    free(rowPointers);

    if (bmpResult != 0) {
        Debug("Error: Failed to save BMP file.\n");
        return 1;
    }

    return 0;
}

