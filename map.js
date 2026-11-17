export function mountGateMap(gates, geography, cities) {
  const L=window.L,container=document.getElementById('gate-map');
  if(!L||!container)return null;
  const map=L.map(container,{center:[25,30],zoom:2,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false,zoomControl:true,scrollWheelZoom:false,attributionControl:true,minZoom:1,maxZoom:8,maxBounds:[[-75,-210],[85,210]],maxBoundsViscosity:.8});
  map.attributionControl.setPrefix(false);
  map.attributionControl.addAttribution('Geography: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a> · Public domain | <a href="https://leafletjs.com/" target="_blank" rel="noopener">Leaflet</a>');
  L.geoJSON(geography,{style:{color:'#476b80',weight:.8,fillColor:'#1d394b',fillOpacity:1},onEachFeature(feature,layer){layer.bindTooltip(feature.properties.name,{className:'country-tooltip',sticky:true});layer.on('mouseover',()=>layer.setStyle({fillColor:'#2b5265'}));layer.on('mouseout',()=>layer.setStyle({fillColor:'#1d394b'}))}}).addTo(map);
  for(let lng=-180;lng<=180;lng+=30)L.polyline([[-70,lng],[80,lng]],{color:'#496c7c',weight:.6,opacity:.25,interactive:false,dashArray:'3 7'}).addTo(map);
  for(let lat=-60;lat<=60;lat+=30)L.polyline([[lat,-180],[lat,180]],{color:'#496c7c',weight:.6,opacity:.25,interactive:false,dashArray:'3 7'}).addTo(map);
  const groups=L.markerClusterGroup({animate:false,maxClusterRadius:42,disableClusteringAtZoom:6,showCoverageOnHover:false,iconCreateFunction(cluster){const count=cluster.getAllChildMarkers().reduce((n,m)=>n+(m.options.incidentCount||0),0);return L.divIcon({className:'incident-marker region-marker',html:'<span class="cluster regional" title="Regional cluster — activate to zoom">'+count+'</span>',iconSize:[38,38],iconAnchor:[19,19]})}}).addTo(map);
  map.getPane('overlayPane').querySelectorAll('svg,path').forEach(el=>el.setAttribute('aria-hidden','true'));
  const grouped={};for(const g of gates)(grouped[g.city]??=[]).push(g);
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  for(const [city,records]of Object.entries(grouped)){
    const c=cities[city];if(!c)continue;
    const level=records.some(g=>g.status==='Gate Break')?'break':records.some(g=>g.status==='Raid Scheduled')?'scheduled':'monitoring';
    const marker=L.marker([c.lat,c.lng],{keyboard:true,incidentCount:records.length,title:`${city} — ${records.length} incidents`,alt:`${city} Gate incident cluster`,icon:L.divIcon({className:'incident-marker',html:`<span class="cluster ${level}">${records.length}</span>`,iconSize:[32,32],iconAnchor:[16,16]})}).addTo(groups);
    marker.bindTooltip(`${city} · ${records.length} incidents`,{direction:'top',offset:[0,-16],className:'city-tooltip'});
    marker.bindPopup(`<div class="map-popup"><div class="eyebrow">CITY INCIDENT CLUSTER</div><h3>${esc(city)}</h3><p class="map-coordinates">${Math.abs(c.lat).toFixed(2)}°${c.lat<0?'S':'N'} · ${Math.abs(c.lng).toFixed(2)}°${c.lng<0?'W':'E'} · approximate centre</p>${records.map(g=>`<a href="#/gate/${encodeURIComponent(g.id)}"><strong>${esc(g.rank)} / ${esc(g.status)}</strong><br>${esc(g.id)}<br><small>${esc(g.environment)}</small></a>`).join('')}<small>Fictional incident feed. No precise Gate location is published.</small></div>`,{maxWidth:310,minWidth:230});
  }
  const world=()=>map.fitBounds([[-47,-105],[68,154]],{padding:[20,20],animate:false});
  if(Object.keys(grouped).length===1){const c=cities[Object.keys(grouped)[0]];map.setView([c.lat,c.lng],5)}else world();
  document.querySelector('[data-map-world]')?.addEventListener('click',world);
  document.querySelector('[data-map-zoom]')?.addEventListener('click',()=>{map.scrollWheelZoom.enable();document.querySelector('[data-map-zoom]').textContent='Scroll zoom enabled';});
  return map;
}
