
def parse_address(component) -> list:
    '''
    Filtrar GeocoderAddressComponents dejando solo los que tienen
    los que estan clasificados como : locality, 
    administrative_area_level_2, administrative_area_level_1
    '''
    types = ['locality', 'administrative_area_level_2', 'administrative_area_level_1']
    address_components = []
    for address in component:
        for addr_type in address['types']:
            if addr_type in types:
                address_components.append(address)
                break
    print(address_components)