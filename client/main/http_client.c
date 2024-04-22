#include "http_client.h"
#include "environment.h"

#include <curl/curl.h>
#include <stdlib.h>


/**
 * Download image from server.
 *
 * @param WIDTH Usable width of the display.
 * @param HEIGHT Usable height of the display.
 *
 * @return 0 if successful. 1 if failed.
 */
int downloadImage(UWORD WIDTH, UWORD HEIGHT) {
    CURL *curl;
    FILE *fp;
    CURLcode res;

    curl = curl_easy_init();
    if(curl) {
        fp = fopen(RPI_ENV_IMAGE_PNG_FILENAME, "wb");
        if(fp == NULL) {
            curl_easy_cleanup(curl);
            return 1; // Failed to open file for writing
        }
        curl_easy_setopt(curl, CURLOPT_URL, RPI_ENV_SERVER_URL);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, fp);

        // Set Authorization header
        struct curl_slist *headers = NULL;
        char DeviceIDHeader[200];
        char DeviceSecretHeader[200];
        char DisplayHeightHeader[200];
        char DisplayWidthHeader[200];
        sprintf(DeviceIDHeader, "X-Device-ID: %s", RPI_ENV_DEVICE_ID);
        sprintf(DeviceSecretHeader, "X-Device-Secret: %s", RPI_ENV_DEVICE_SECRET);
        sprintf(DisplayHeightHeader, "X-Display-Height: %d", HEIGHT);
        sprintf(DisplayWidthHeader, "X-Display-Width: %d", WIDTH);

        headers = curl_slist_append(headers, DeviceIDHeader);
        headers = curl_slist_append(headers, DeviceSecretHeader);
        headers = curl_slist_append(headers, DisplayHeightHeader);
        headers = curl_slist_append(headers, DisplayWidthHeader);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
        fclose(fp);
        if(res != CURLE_OK)
            return 1; // Error during download
    }
    return 0; // Success
}
