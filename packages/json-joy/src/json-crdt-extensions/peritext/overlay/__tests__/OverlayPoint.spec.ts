import type {Point} from '../../rga/Point';
import {setup} from '../../slice/__tests__/setup';
import {OverlayPoint} from '../OverlayPoint';
import type {OverlayRefSliceEnd, OverlayRefSliceStart} from '../refs';

const setupOverlayPoint = () => {
  const deps = setup();
  const getPoint = (point: Point) => {
    return new OverlayPoint(deps.peritext.str, point.id, point.anchor);
  };
  return {
    ...deps,
    getPoint,
  };
};

describe('layers', () => {
  test('can add a layer', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const slice = peritext.savedSlices.insOne(peritext.rangeAt(5, 5), '<b>');
    const point = getPoint(slice.start);
    expect(point.layers.length).toBe(0);
    point.addLayer(slice);
    expect(point.layers.length).toBe(1);
    expect(point.layers[0]).toBe(slice);
  });

  test('inserting same slice twice is a no-op', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const slice = peritext.savedSlices.insOne(peritext.rangeAt(5, 5), '<b>');
    const point = getPoint(slice.start);
    expect(point.layers.length).toBe(0);
    point.addLayer(slice);
    point.addLayer(slice);
    point.addLayer(slice);
    expect(point.layers.length).toBe(1);
    expect(point.layers[0]).toBe(slice);
  });

  test('can add two layers with the same start position', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const slice1 = peritext.savedSlices.insOne(peritext.rangeAt(5, 5), '<b>');
    const slice2 = peritext.savedSlices.insOne(peritext.rangeAt(5, 3), '<i>');
    const point = getPoint(slice1.start);
    expect(point.layers.length).toBe(0);
    point.addLayer(slice1);
    expect(point.layers.length).toBe(1);
    point.addLayer(slice2);
    point.addLayer(slice2);
    expect(point.layers.length).toBe(2);
    expect(point.layers[0]).toBe(slice1);
    expect(point.layers[1]).toBe(slice2);
  });

  test('orders slices by their ID', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const slice1 = peritext.savedSlices.insOne(peritext.rangeAt(5, 5), '<b>');
    const slice2 = peritext.savedSlices.insOne(peritext.rangeAt(5, 3), '<i>');
    const point = getPoint(slice1.start);
    point.addLayer(slice2);
    point.addLayer(slice1);
    expect(point.layers[0]).toBe(slice1);
    expect(point.layers[1]).toBe(slice2);
  });

  test('can add tree layers and sort them correctly', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const slice1 = peritext.savedSlices.insOne(peritext.rangeAt(5, 5), '<b>');
    const slice2 = peritext.savedSlices.insOne(peritext.rangeAt(5, 3), '<i>');
    const slice3 = peritext.savedSlices.insOne(peritext.rangeAt(2, 10), '<u>');
    const point = getPoint(slice1.start);
    point.addLayer(slice3);
    point.addLayer(slice3);
    point.addLayer(slice2);
    point.addLayer(slice3);
    point.addLayer(slice1);
    point.addLayer(slice3);
    point.addLayer(slice3);
    expect(point.layers.length).toBe(3);
    expect(point.layers[0]).toBe(slice1);
    expect(point.layers[1]).toBe(slice2);
    expect(point.layers[2]).toBe(slice3);
  });

  test('can add tree layers by appending them', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const slice1 = peritext.savedSlices.insOne(peritext.rangeAt(5, 5), '<b>');
    const slice2 = peritext.savedSlices.insOne(peritext.rangeAt(5, 3), '<i>');
    const slice3 = peritext.savedSlices.insOne(peritext.rangeAt(2, 10), '<u>');
    const point = getPoint(slice1.start);
    point.addLayer(slice1);
    point.addLayer(slice2);
    point.addLayer(slice3);
    expect(point.layers[0]).toBe(slice1);
    expect(point.layers[1]).toBe(slice2);
    expect(point.layers[2]).toBe(slice3);
  });

  test('can remove layers', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const slice1 = peritext.savedSlices.insOne(peritext.rangeAt(5, 5), '<b>');
    const slice2 = peritext.savedSlices.insOne(peritext.rangeAt(5, 3), '<i>');
    const slice3 = peritext.savedSlices.insOne(peritext.rangeAt(2, 10), '<u>');
    const point = getPoint(slice1.start);
    point.addLayer(slice2);
    point.addLayer(slice1);
    point.addLayer(slice1);
    point.addLayer(slice1);
    point.addLayer(slice3);
    expect(point.layers[0]).toBe(slice1);
    expect(point.layers[1]).toBe(slice2);
    expect(point.layers[2]).toBe(slice3);
    point.removeLayer(slice2);
    expect(point.layers[0]).toBe(slice1);
    expect(point.layers[1]).toBe(slice3);
    point.removeLayer(slice1);
    expect(point.layers[0]).toBe(slice3);
    point.removeLayer(slice1);
    point.removeLayer(slice3);
    expect(point.layers.length).toBe(0);
  });
});

describe('markers', () => {
  test('can add a marker', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const marker = peritext.savedSlices.insMarker(peritext.rangeAt(5, 0), '<p>');
    const point = getPoint(marker.start);
    expect(point.markers.length).toBe(0);
    point.addMarkerRef(marker);
    expect(point.markers.length).toBe(1);
    expect(point.markers[0]).toBe(marker);
  });

  test('inserting same marker twice is a no-op', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const marker = peritext.savedSlices.insMarker(peritext.rangeAt(5, 0), '<p>');
    const point = getPoint(marker.start);
    expect(point.markers.length).toBe(0);
    point.addMarkerRef(marker);
    point.addMarkerRef(marker);
    point.addMarkerRef(marker);
    point.addMarkerRef(marker);
    expect(point.markers.length).toBe(1);
    expect(point.markers[0]).toBe(marker);
  });

  test('can add two markers with the same start position', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const marker1 = peritext.savedSlices.insMarker(peritext.rangeAt(5, 0), '<p>');
    const marker2 = peritext.savedSlices.insMarker(peritext.rangeAt(5, 0), '<p>');
    const point = getPoint(marker1.start);
    expect(point.markers.length).toBe(0);
    point.addMarkerRef(marker1);
    expect(point.markers.length).toBe(1);
    point.addMarkerRef(marker2);
    point.addMarkerRef(marker2);
    expect(point.markers.length).toBe(2);
    expect(point.markers[0]).toBe(marker1);
    expect(point.markers[1]).toBe(marker2);
  });

  test('orders markers by their ID', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const marker1 = peritext.savedSlices.insMarker(peritext.rangeAt(5, 0), '<p>');
    const marker2 = peritext.savedSlices.insMarker(peritext.rangeAt(5, 0), '<p>');
    const point = getPoint(marker1.start);
    point.addMarkerRef(marker2);
    point.addMarkerRef(marker1);
    point.addMarkerRef(marker2);
    point.addMarkerRef(marker1);
    point.addMarkerRef(marker2);
    point.addMarkerRef(marker1);
    expect(point.markers[0]).toBe(marker1);
    expect(point.markers[1]).toBe(marker2);
  });

  test('can add tree markers and sort them correctly', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const marker1 = peritext.savedSlices.insMarker(peritext.rangeAt(5, 0), '<p>');
    const marker2 = peritext.savedSlices.insMarker(peritext.rangeAt(5, 0), '<p>');
    const marker3 = peritext.savedSlices.insMarker(peritext.rangeAt(5, 0), '<p>');
    const point = getPoint(marker1.start);
    point.addMarkerRef(marker3);
    point.addMarkerRef(marker3);
    point.addMarkerRef(marker2);
    point.addMarkerRef(marker2);
    point.addMarkerRef(marker3);
    point.addMarkerRef(marker1);
    point.addMarkerRef(marker3);
    point.addMarkerRef(marker3);
    expect(point.markers.length).toBe(3);
    expect(point.markers[0]).toBe(marker1);
    expect(point.markers[1]).toBe(marker2);
    expect(point.markers[2]).toBe(marker3);
  });

  test('can add tree markers by appending them', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const marker1 = peritext.savedSlices.insMarker(peritext.rangeAt(6, 1), '<p>');
    const marker2 = peritext.savedSlices.insMarker(peritext.rangeAt(6, 2), '<p>');
    const marker3 = peritext.savedSlices.insMarker(peritext.rangeAt(6, 3), '<p>');
    const point = getPoint(marker2.start);
    point.addMarkerRef(marker1);
    point.addMarkerRef(marker2);
    point.addMarkerRef(marker3);
    expect(point.markers[0]).toBe(marker1);
    expect(point.markers[1]).toBe(marker2);
    expect(point.markers[2]).toBe(marker3);
  });

  test('can remove markers', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const marker1 = peritext.savedSlices.insMarker(peritext.rangeAt(6, 1), '<p>');
    const marker2 = peritext.savedSlices.insMarker(peritext.rangeAt(6, 1), '<p>');
    const marker3 = peritext.savedSlices.insMarker(peritext.rangeAt(6, 2), '<p>');
    const point = getPoint(marker1.start);
    point.addMarkerRef(marker2);
    point.addMarkerRef(marker1);
    point.addMarkerRef(marker1);
    point.addMarkerRef(marker1);
    point.addMarkerRef(marker3);
    expect(point.markers[0]).toBe(marker1);
    expect(point.markers[1]).toBe(marker2);
    expect(point.markers[2]).toBe(marker3);
    point.removeMarker(marker2);
    expect(point.markers[0]).toBe(marker1);
    expect(point.markers[1]).toBe(marker3);
    point.removeMarker(marker1);
    expect(point.markers[0]).toBe(marker3);
    point.removeMarker(marker1);
    point.removeMarker(marker3);
    expect(point.markers.length).toBe(0);
  });
});

describe('refs', () => {
  test('can add marker ref', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const marker = peritext.savedSlices.insMarker(peritext.rangeAt(10, 1), '<p>');
    const point = getPoint(marker.start);
    expect(point.markers.length).toBe(0);
    expect(point.refs.length).toBe(0);
    point.addMarkerRef(marker);
    expect(point.markers.length).toBe(1);
    expect(point.refs.length).toBe(1);
    expect(point.markers[0]).toBe(marker);
    expect(point.refs[0]).toBe(marker);
  });

  test('can add layer ref (start)', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const slice = peritext.savedSlices.insErase(peritext.rangeAt(0, 4), 123);
    const point = getPoint(slice.start);
    expect(point.layers.length).toBe(0);
    expect(point.refs.length).toBe(0);
    point.upsertStartRef(slice);
    point.addLayer(slice);
    expect(point.layers.length).toBe(1);
    expect(point.refs.length).toBe(1);
    expect(point.layers[0]).toBe(slice);
    expect((point.refs[0] as OverlayRefSliceStart).slice).toBe(slice);
  });

  test('can add layer ref (end)', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const slice = peritext.savedSlices.insErase(peritext.rangeAt(0, 4), 123);
    const point = getPoint(slice.end);
    expect(point.layers.length).toBe(0);
    expect(point.refs.length).toBe(0);
    point.upsertEndRef(slice);
    expect(point.layers.length).toBe(0);
    expect(point.refs.length).toBe(1);
    expect((point.refs[0] as OverlayRefSliceEnd).slice).toBe(slice);
  });

  test('can add marker and layer start', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const marker = peritext.savedSlices.insMarker(peritext.rangeAt(10, 1), '<p>');
    const slice = peritext.savedSlices.insErase(peritext.rangeAt(10, 4), 123);
    const point = getPoint(slice.end);
    expect(point.layers.length).toBe(0);
    expect(point.markers.length).toBe(0);
    expect(point.refs.length).toBe(0);
    point.addMarkerRef(marker);
    point.upsertStartRef(slice);
    point.addLayer(slice);
    expect(point.layers.length).toBe(1);
    expect(point.markers.length).toBe(1);
    expect(point.refs.length).toBe(2);
  });

  test('can remove marker and layer', () => {
    const {peritext, getPoint} = setupOverlayPoint();
    const marker = peritext.savedSlices.insMarker(peritext.rangeAt(10, 1), '<p>');
    const slice = peritext.savedSlices.insErase(peritext.rangeAt(10, 4), 123);
    const point = getPoint(slice.end);
    point.addMarkerRef(marker);
    point.upsertStartRef(slice);
    point.addLayer(slice);
    expect(point.layers.length).toBe(1);
    expect(point.markers.length).toBe(1);
    expect(point.refs.length).toBe(2);
    point.removeRef(slice);
    expect(point.layers.length).toBe(0);
    expect(point.markers.length).toBe(1);
    expect(point.refs.length).toBe(1);
    point.removeRef(marker);
    expect(point.layers.length).toBe(0);
    expect(point.markers.length).toBe(0);
    expect(point.refs.length).toBe(0);
  });
});
