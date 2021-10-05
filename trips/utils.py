
def parse_address(component) -> dict:
    '''
    Filtrar GeocoderAddressComponents dejando solo los que tienen
    los que estan clasificados como : locality, 
    administrative_area_level_2, administrative_area_level_1
    '''
    types = ['locality', 'administrative_area_level_2', 'administrative_area_level_1']
    address_components = {}
    for address in component:
        for addr_type in address['types']:
            if addr_type == 'locality':
                address_components['locality'] = address['long_name']
            elif addr_type == 'administrative_area_level_2':
                address_components['administrative_area_level_2'] = address['long_name']
            elif addr_type == 'administrative_area_level_1':
                address_components['administrative_area_level_1'] = address['long_name']
            break
    return address_components