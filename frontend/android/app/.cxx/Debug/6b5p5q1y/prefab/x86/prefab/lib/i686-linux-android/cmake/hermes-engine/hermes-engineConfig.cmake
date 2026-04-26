if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/dam1/.gradle/caches/8.14.3/transforms/75e0bbb3ffc7836406464e125d9b65f5/transformed/hermes-android-0.81.4-debug/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/dam1/.gradle/caches/8.14.3/transforms/75e0bbb3ffc7836406464e125d9b65f5/transformed/hermes-android-0.81.4-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

